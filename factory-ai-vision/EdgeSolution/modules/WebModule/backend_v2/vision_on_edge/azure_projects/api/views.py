# -*- coding: utf-8 -*-
"""App views"""

from __future__ import absolute_import, unicode_literals

import datetime
import logging
import traceback
from distutils.util import strtobool

from azure.cognitiveservices.vision.customvision.training.models import \
    CustomVisionErrorException
from django.shortcuts import get_object_or_404
from django.utils import timezone
from filters.mixins import FiltersMixin
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from ...azure_parts.models import Part
#from ...azure_parts.utils import batch_upload_parts_to_customvision
#from ...azure_training_status import constants as progress_constants
#from ...azure_training_status.models import TrainingStatus
#from ...azure_training_status.utils import upcreate_training_status
#from ...cameras.models import Camera
from ...exceptions import api_exceptions as error_messages
#from ...general.utils import normalize_rtsp
from ...images.models import Image
#from ...images.utils import upload_images_to_customvision_helper
from ..models import Project, Task
from ..utils import pull_cv_project_helper, train_project_helper, update_train_status_helper  #, update_app_insight_counter
from .serializers import ProjectSerializer, TaskSerializer, IterationPerformanceSerializer, ProjectPerformanesSerializer

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

    @swagger_auto_schema(operation_summary='Keep relabel alive.')
    @action(detail=True, methods=["post"])
    def relabel_keep_alive(self, request, pk=None) -> Response:
        """relabel_keep_alive.
        """
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=pk)
        obj.relabel_expired_time = timezone.now() + datetime.timedelta(
            seconds=PROJECT_RELABEL_TIME_THRESHOLD)
        obj.save()
        serializer = ProjectSerializer(obj)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary='Get training performace from Custom Vision.',
        responses={'200': ProjectPerformanesSerializer})
    @action(detail=True, methods=["get"])
    def train_performance(self, request, pk=None) -> Response:
        """train_performance.
        """
        queryset = self.get_queryset()
        project_obj = get_object_or_404(queryset, pk=pk)
        trainer = project_obj.setting.revalidate_and_get_trainer_obj()
        customvision_project_id = project_obj.customvision_id

        res_data = {"iterations": []}

        def _parse(iteration, iteration_name: str):
            """_parse.

            Args:
                iteration:
            """
            iteration_id = iteration.id
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
                "iteration_name": iteration_name,
                "iteration_id": iteration_id,
                "status": iteration_status,
                "precision": precision,
                "recall": recall,
                "mAP": mAP,
            }

        if project_obj.is_demo:
            iteration_data = {
                "iteration_name": "demo",
                "iteration_id": "demo_iteration_id",
                "status": "ok",
                "precision": 1,
                "recall": 0.0,
                "mAP": 0.0,
            }
            iteration_serialzer = IterationPerformanceSerializer(
                data=iteration_data)
            if iteration_serialzer.is_valid(raise_exception=True):
                res_data["iterations"].append(iteration_serialzer.data)
            project_performance_serializer = ProjectPerformanesSerializer(
                data=res_data)
        else:
            iterations = trainer.get_iterations(customvision_project_id)
            for i in range(min(2, len(iterations))):
                iteration_data = _parse(
                    iterations[i],
                    iteration_name=("new" if i == 0 else "previous"))
                iteration_serialzer = IterationPerformanceSerializer(
                    data=iteration_data)
                if iteration_serialzer.is_valid(raise_exception=True):
                    res_data["iterations"].append(iteration_serialzer.data)

        project_performance_serializer = ProjectPerformanesSerializer(
            data=res_data)
        if project_performance_serializer.is_valid(raise_exception=True):
            return Response(data=project_performance_serializer.data)

    @swagger_auto_schema(operation_summary='reset project',
                         manual_parameters=[
                             openapi.Parameter('project_name',
                                               openapi.IN_QUERY,
                                               type=openapi.TYPE_STRING,
                                               description='Project name'),
                         ])
    @action(detail=True, methods=["get"])
    def reset_project(self, request, pk=None) -> Response:
        """reset_project.
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

    @swagger_auto_schema(
        operation_summary='Pull a Custom Vision project',
        manual_parameters=[
            openapi.Parameter('customvision_project_id',
                              openapi.IN_QUERY,
                              type=openapi.TYPE_STRING,
                              description='Custom Vision Id to Pull'),
            openapi.Parameter('partial',
                              openapi.IN_QUERY,
                              type=openapi.TYPE_BOOLEAN,
                              description='partial download or not')
        ])
    @action(detail=True, methods=["get"])
    def pull_cv_project(self, request, pk=None) -> Response:
        """pull_cv_project.
        """
        logger.info("Pulling CustomVision Project")

        queryset = self.get_queryset()
        project_obj = get_object_or_404(queryset, pk=pk)

        # Check Customvision Project id
        customvision_project_id = request.query_params.get(
            "customvision_project_id")
        logger.info("Project customvision_id: %s", {customvision_project_id})
        project_obj.customvision_id = customvision_project_id
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

    @swagger_auto_schema(operation_summary='Train project')
    @action(detail=True, methods=["get"])
    def train(self, request, pk=None) -> Response:
        """train.
        """
        queryset = self.get_queryset()
        project_obj = get_object_or_404(queryset, pk=pk)
        train_project_helper(project_id=project_obj.id)
        update_train_status_helper(project_id=project_obj.id)
        return Response({'status': 'ok'})

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
        # A Thread/Task to keep updating the status
        # update_train_status(project_id)
        # return Response({"status": "ok"})


# def upload_and_train(project_id):
# """upload_and_train.

# Args:
# project_id:
# """

# except CustomVisionErrorException as customvision_err:
# logger.error("CustomVisionErrorException: %s", customvision_err)
# if customvision_err.message == \
# "Operation returned an invalid status code 'Access Denied'":
# upcreate_training_status(
# project_id=project_obj.id,
# status="failed",
# log=
# "Training key or Endpoint is invalid. Please change the settings",
# need_to_send_notification=True,
# )
# return Response(
# {
# "status":
# "failed",
# "log":
# "Training key or Endpoint is invalid. Please change the settings",
# },
# status=status.HTTP_503_SERVICE_UNAVAILABLE,
# )

# upcreate_training_status(project_id=project_obj.id,
# status="failed",
# log=customvision_err.message,
# need_to_send_notification=True)
# return Response(
# {
# "status": "failed",
# "log": customvision_err.message
# },
# status=status.HTTP_400_BAD_REQUEST,
# )

# except Exception:
# # TODO: Remove in production
# err_msg = traceback.format_exc()
# logger.exception("Exception: %s", err_msg)
# upcreate_training_status(project_id=project_obj.id,
# status="failed",
# log=f"failed {str(err_msg)}",
# need_to_send_notification=True)
# return Response({"status": "failed", "log": f"failed {str(err_msg)}"})


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
