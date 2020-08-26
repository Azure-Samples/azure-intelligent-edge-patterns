# -*- coding: utf-8 -*-
"""App views"""

from __future__ import absolute_import, unicode_literals

import datetime
import json
import logging
import threading
import time
import traceback
from distutils.util import strtobool

import requests
from azure.cognitiveservices.vision.customvision.training.models import \
    CustomVisionErrorException
from django.shortcuts import get_object_or_404
from django.utils import timezone
from filters.mixins import FiltersMixin
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from ...azure_iot.utils import inference_module_url
from ...azure_parts.models import Part
#from ...azure_parts.utils import batch_upload_parts_to_customvision
#from ...azure_training_status import constants as progress_constants
#from ...azure_training_status.models import TrainingStatus
#from ...azure_training_status.utils import upcreate_training_status
#from ...cameras.models import Camera
#from ...general import error_messages
#from ...general.utils import normalize_rtsp
#from ...images.models import Image
#from ...images.utils import upload_images_to_customvision_helper
from ..models import Project, Task
from ..utils import pull_cv_project_helper  #, update_app_insight_counter
from .serializers import ProjectSerializer, TaskSerializer

logger = logging.getLogger(__name__)

PROJECT_RELABEL_TIME_THRESHOLD = 30  # Seconds


class ProjectViewSet(FiltersMixin, viewsets.ModelViewSet):
    """Project ModelViewSet

    Filters:
        is_demo
    """

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        "is_demo": "is_demo",
    }

    @action(detail=True, methods=["post"])
    def relabel_keep_alive(self, request, pk=None) -> Response:
        """relabel_keep_alive.

        Args:
            request:
            kwargs:

        Returns:
            Response: Return project with updated timestamp
        """
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=pk)
        obj.relabel_expired_time = timezone.now() + datetime.timedelta(
            seconds=PROJECT_RELABEL_TIME_THRESHOLD)
        obj.save()
        serializer = ProjectSerializer(obj)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def train_performance(self, request, pk=None) -> Response:
        """train_performance.

        Get train performace of this iter and previous iter
        """
        queryset = self.get_queryset()
        project_obj = get_object_or_404(queryset, pk=pk)
        trainer = project_obj.setting.revalidate_and_get_trainer_obj()
        customvision_project_id = project_obj.customvision_project_id

        if project_obj.is_demo:
            return Response({
                "status": "ok",
                "precision": 1,
                "recall": "demo_recall",
                "map": "demo_map",
            })

        ret = {}
        iterations = trainer.get_iterations(customvision_project_id)

        def _parse(iteration):
            """_parse.

            Args:
                iteration:
            """
            iteration = iteration.as_dict()
            iteration_status = iteration["status"]
            if iteration_status == "Completed":
                performance = trainer.get_iteration_performance(
                    customvision_project_id, iteration["id"]).as_dict()
                precision = performance["precision"]
                recall = performance["recall"]
                mAP = performance["average_precision"]
            else:
                precision = 0.0
                recall = 0.0
                mAP = 0.0
            return {
                "status": iteration_status,
                "precision": precision,
                "recall": recall,
                "map": mAP,
            }

        if len(iterations) >= 1:
            ret["new"] = _parse(iterations[0])
        if len(iterations) >= 2:
            ret["previous"] = _parse(iterations[1])
        return Response(ret)

    @action(detail=True, methods=["get"])
    def reset_project(self, request, pk=None) -> Response:
        """reset_project.

        Reset the project but not deleting.

        Args:
            request:
            project_id:
        """

        queryset = self.get_queryset()
        project_obj = get_object_or_404(queryset, pk=pk)
        project_name = request.query_params.get("project_name")
        if not project_name:
            return Response(
                {
                    "status": "failed",
                    "log": "project_name required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            Part.objects.filter(project=project_obj).delete()
            Image.objects.all().delete()
            project_obj.customvision_id = ""
            project_obj.name = project_name
            project_obj.download_uri = ""
            project_obj.needRetraining = Project._meta.get_field(
                "needRetraining").get_default()
            project_obj.maxImages = Project._meta.get_field(
                "maxImages").get_default()
            project_obj.deployed = False
            project_obj.save()
            project_obj.create_project()
            return Response({"status": "ok"})
        except KeyError as key_err:
            if str(key_err) in ["Endpoint", "'Endpoint'"]:
                # Probably reseting without training key and endpoint. When user
                # click configure, project will check customvision_id. If empty
                # than create project, Thus we can pass for now. Wait for
                # configure/training to create project...
                return Response({"status": "ok"})
            logger.exception("Reset project unexpected key error")
            return Response(
                {
                    "status": "failed",
                    "log": str(key_err)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except CustomVisionErrorException as err:
            logger.exception("Error from Custom Vision")
            if (err.message ==
                    "Operation returned an invalid status code 'Access Denied'"
               ):
                return Response(
                    {
                        "status": "failed",
                        "log": error_messages.CUSTOM_VISION_ACCESS_ERROR
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            return Response(
                {
                    "status": "failed",
                    "log": err.message
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

    @swagger_auto_schema(method='get',
                         operation_summary='Pull a Custom Vision project',
                         manual_parameters=[
                             openapi.Parameter(
                                 'customvision_project_id',
                                 openapi.IN_QUERY,
                                 type=openapi.TYPE_STRING,
                                 description='Custom Vision Id to Pull'),
                             openapi.Parameter('partial',
                                               openapi.IN_QUERY,
                                               type=openapi.TYPE_BOOLEAN,
                                               description='')
                         ])
    @action(detail=True, methods=["get"])
    def pull_cv_project(self, request, pk=None) -> Response:
        logger.info("Pulling CustomVision Project")

        queryset = self.get_queryset()
        project_obj = get_object_or_404(queryset, pk=pk)
        # Check Customvision Project id
        customvision_project_id = request.query_params.get(
            "customvision_project_id")
        logger.info("customvision_project_id: %s", {customvision_project_id})
        project_obj.customvision_project_id = customvision_project_id
        project_obj.save()
        # Check Partial
        try:
            is_partial = bool(strtobool(request.query_params.get("partial")))
        except Exception:
            is_partial = True
        logger.info("Loading Project in Partial Mode: %s", is_partial)

        try:
            pull_cv_project_helper(
                project_id=project_obj.id,
                customvision_project_id=customvision_project_id,
                is_partial=is_partial)
            return Response({"status": "ok"}, status=status.HTTP_200_OK)
        except Exception:
            err_msg = traceback.format_exc()
            logger.exception("Pull Custom Vision Project error")
            return Response(
                {
                    "status": "failed",
                    "log":
                        str(err_msg)  # Change line plz...
                },
                status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"])
    def train(self, request, pk=None) -> Response:
        """train.

        Configure button. Train/Export/Deploy a project.

        Args:
            request:
            project_id:
        """
        # is_demo = request.query_params.get("demo")
        # project_obj = Project.objects.get(pk=project_id)
        # parts = Part.objects.filter(project_id=project_obj.id)
        # rtsp = project_obj.camera.rtsp
        # download_uri = project_obj.download_uri

        # if is_demo and (is_demo.lower() == "true") or project_obj.is_demo:
        # logger.info("demo... bypass training process")

        # cam_is_demo = project_obj.camera.is_demo
        # # Camera FIXME peter, check here
        # if cam_is_demo:
        # rtsp = project_obj.camera.rtsp
        # requests.get(
        # "http://" + inference_module_url() + "/update_cam",
        # params={
        # "cam_type": "rtsp",
        # "cam_source": normalize_rtsp(rtsp)
        # },
        # )
        # else:
        # rtsp = project_obj.camera.rtsp
        # requests.get(
        # "http://" + inference_module_url() + "/update_cam",
        # params={
        # "cam_type": "rtsp",
        # "cam_source": normalize_rtsp(rtsp)
        # },
        # )

        # requests.get(
        # "http://" + inference_module_url() + "/update_model",
        # params={"model_dir": "default_model"},
        # )
        # # '/update_model', params={'model_dir': 'default_model_6parts'})

        # logger.info("Update parts %s", parts)
        # requests.get(
        # "http://" + inference_module_url() + "/update_parts",
        # params={"parts": parts},
        # )
        # requests.get(
        # "http://" + inference_module_url() + "/update_retrain_parameters",
        # params={
        # "confidence_min": 30,
        # "confidence_max": 30,
        # "max_images": 10
        # },
        # )

        # upcreate_training_status(project_id=project_obj.id,
        # status="ok",
        # log="demo ok")
        # project_obj.has_configured = True
        # project_obj.save()
        # # pass the new model info to inference server in post_save()
        # return Response({"status": "ok"})

        # upcreate_training_status(project_id=project_obj.id,
        # status="preparing",
        # log="preparing data (images and annotations)")
        # logger.info("sleeping")

        # def _send(rtsp, parts, download_uri):
        # logger.info("**** updating cam to %s", rtsp)
        # requests.get(
        # "http://" + inference_module_url() + "/update_cam",
        # params={
        # "cam_type": "rtsp",
        # "cam_source": normalize_rtsp(rtsp)
        # },
        # )
        # requests.get(
        # "http://" + inference_module_url() + "/update_model",
        # params={"model_uri": download_uri},
        # )
        # requests.get(
        # "http://" + inference_module_url() + "/update_parts",
        # params={"parts": parts},
        # )

        # threading.Thread(target=_send, args=(rtsp, parts, download_uri)).start()
        # return upload_and_train(project_id)


def upload_and_train(project_id):
    """upload_and_train.

    Args:
        project_id:
    """

    project_obj = Project.objects.get(pk=project_id)
    trainer = project_obj.setting.revalidate_and_get_trainer_obj()
    customvision_project_id = project_obj.customvision_project_id

    # Invalid Endpoint + Training Key
    if not trainer:
        upcreate_training_status(project_id=project_obj.id,
                                 status="failed",
                                 log=error_messages.CUSTOM_VISION_ACCESS_ERROR)
        return Response(
            {
                "status": "failed",
                "log": error_messages.CUSTOM_VISION_ACCESS_ERROR
            },
            status=503,
        )

    upcreate_training_status(project_id=project_obj.id,
                             **progress_constants.PROGRESS_1_FINDING_PROJECT)

    project_obj.dequeue_iterations()

    try:
        part_ids = [
            part.id for part in Part.objects.filter(project=project_obj)
        ]

        logger.info("Project id: %s", project_obj.id)
        logger.info("Part ids: %s", part_ids)
        try:
            trainer.get_project(customvision_project_id)
            upcreate_training_status(
                project_id=project_obj.id,
                status="preparing",
                log=(f"Project {project_obj.customvision_project_name} " +
                     "found on Custom Vision"),
            )
        except Exception:
            project_obj.create_project()
            upcreate_training_status(
                project_id=project_obj.id,
                need_to_send_notification=True,
                **progress_constants.PROGRESS_2_PROJECT_CREATED)

            logger.info("Project created on CustomVision.")
            logger.info("Project Id: %s", project_obj.customvision_project_id)
            logger.info("Project Name: %s",
                        project_obj.customvision_project_name)
            customvision_project_id = project_obj.customvision_project_id

        upcreate_training_status(
            project_id=project_obj.id,
            need_to_send_notification=True,
            **progress_constants.PROGRESS_3_UPLOADING_PARTS)

        # Get tags_dict to avoid getting tags every time
        tags = trainer.get_tags(project_id=project_obj.customvision_project_id)
        tags_dict = {tag.name: tag.id for tag in tags}

        # App Insight
        project_changed = False
        has_new_parts = False
        has_new_images = False
        parts_last_train = len(tags)
        images_last_train = trainer.get_tagged_image_count(
            project_obj.customvision_project_id)

        # Create/update tags on CustomVisioin Project
        has_new_parts = batch_upload_parts_to_customvision(
            project_id=project_id, part_ids=part_ids, tags_dict=tags_dict)
        if has_new_parts:
            project_changed = True

        upcreate_training_status(
            project_id=project_obj.id,
            need_to_send_notification=True,
            **progress_constants.PROGRESS_4_UPLOADING_IMAGES)

        # Upload images to CustomVisioin Project
        for part_id in part_ids:
            logger.info("Uploading images with part_id %s", part_id)
            has_new_images = upload_images_to_customvision_helper(
                project_id=project_obj.id, part_id=part_id)
            if has_new_images:
                project_changed = True

        # Submit training task to Custom Vision
        if not project_changed:
            upcreate_training_status(
                project_id=project_obj.id,
                status="deploying",
                log="No new parts or new images to train. Deploying")
        else:
            upcreate_training_status(
                project_id=project_obj.id,
                need_to_send_notification=True,
                **progress_constants.PROGRESS_5_SUBMITTING_TRAINING_TASK)
            training_task_submit_success = project_obj.train_project()
            if training_task_submit_success:
                update_app_insight_counter(
                    project_obj=project_obj,
                    has_new_parts=has_new_parts,
                    has_new_images=has_new_images,
                    parts_last_train=parts_last_train,
                    images_last_train=images_last_train,
                )
        # A Thread/Task to keep updating the status
        update_train_status(project_id)
        return Response({"status": "ok"})

    except CustomVisionErrorException as customvision_err:
        logger.error("CustomVisionErrorException: %s", customvision_err)
        if customvision_err.message == \
                "Operation returned an invalid status code 'Access Denied'":
            upcreate_training_status(
                project_id=project_obj.id,
                status="failed",
                log=
                "Training key or Endpoint is invalid. Please change the settings",
                need_to_send_notification=True,
            )
            return Response(
                {
                    "status":
                        "failed",
                    "log":
                        "Training key or Endpoint is invalid. Please change the settings",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        upcreate_training_status(project_id=project_obj.id,
                                 status="failed",
                                 log=customvision_err.message,
                                 need_to_send_notification=True)
        return Response(
            {
                "status": "failed",
                "log": customvision_err.message
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception:
        # TODO: Remove in production
        err_msg = traceback.format_exc()
        logger.exception("Exception: %s", err_msg)
        upcreate_training_status(project_id=project_obj.id,
                                 status="failed",
                                 log=f"failed {str(err_msg)}",
                                 need_to_send_notification=True)
        return Response({"status": "failed", "log": f"failed {str(err_msg)}"})


class TaskViewSet(FiltersMixin, viewsets.ModelViewSet):
    """Task ModelViewSet

    Available filters:
    @project
    """

    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        "project": "project",
    }
