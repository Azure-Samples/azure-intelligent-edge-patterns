# -*- coding: utf-8 -*-
"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import io
import logging

import requests
from django.core.files.images import ImageFile
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from filters.mixins import FiltersMixin
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ...azure_projects.utils import (train_project_helper,
                                     update_train_status_helper)
from ...azure_training_status import progress
from ...azure_training_status.models import TrainingStatus
from ...azure_training_status.utils import upcreate_training_status
from ...general.api.serializers import SimpleStatusSerializer
from ...images.models import Image
from ..models import PartDetection
from ..utils import if_trained_then_deploy_helper
from .serializers import (ExportSerializer, PartDetectionSerializer,
                          UploadRelabelSerializer)

logger = logging.getLogger(__name__)


class PartDetectionViewSet(FiltersMixin, viewsets.ModelViewSet):
    """Project ModelViewSet
    """

    queryset = PartDetection.objects.all()
    serializer_class = PartDetectionSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        "inference_module": "inference_module",
        "camera": "camera",
        "project": "project"
    }

    @action(detail=True, methods=["get"])
    def update_prob_threshold(self, request, pk=None) -> Response:
        """update inference bounding box threshold"""
        queryset = self.get_queryset()
        part_detection_obj = get_object_or_404(queryset, pk=pk)
        prob_threshold = request.query_params.get("prob_threshold")

        if prob_threshold is None:
            return Response(
                {
                    'status': 'failed',
                    'log': 'prob_threshold must be given as Integer'
                },
                status=status.HTTP_400_BAD_REQUEST)

        try:
            prob_threshold = int(prob_threshold)
            if prob_threshold > 100 or prob_threshold < 0:
                return Response(
                    {
                        'status': 'failed',
                        'log': 'prob_threshold out of range'
                    },
                    status=status.HTTP_400_BAD_REQUEST)
            # Real function call
            part_detection_obj.update_prob_threshold(
                prob_threshold=prob_threshold)
            return Response({'status': 'ok'})
        except ValueError:
            return Response(
                {
                    'status': 'failed',
                    'log': 'prob_threshold must be given as Integer'
                },
                status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(operation_summary='Export Part Detection status',
                         responses={'200': ExportSerializer})
    @action(detail=True, methods=["get"])
    def export(self, request, pk=None) -> Response:
        """get the status of train job sent to custom vision
        """
        queryset = self.get_queryset()
        part_detection_obj = get_object_or_404(queryset, pk=pk)
        project_obj = part_detection_obj.project
        training_status_obj = TrainingStatus.objects.get(project=project_obj)

        success_rate = 0.0
        inference_num = 0
        unidentified_num = 0
        try:
            res = requests.get("http://" +
                               part_detection_obj.inference_module.url +
                               "/metrics")
            data = res.json()
            success_rate = int(data["success_rate"] * 100) / 100
            inference_num = data["inference_num"]
            unidentified_num = data["unidentified_num"]
            is_gpu = data["is_gpu"]
            average_inference_time = data["average_inference_time"]
            last_prediction_count = data["last_prediction_count"]
            logger.info("success_rate: %s. inference_num: %s", success_rate,
                        inference_num)
        except requests.exceptions.ConnectionError:
            logger.error(
                "Export failed. Inference module url: %s unreachable",
                part_detection_obj.inference_module.url,
            )
            return Response(
                {
                    "status":
                        "failed",
                    "log":
                        "Export failed. Inference module url: " +
                        part_detection_obj.inference_module.url +
                        " unreachable",
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response({
            "status": training_status_obj.status,
            "log": "Status: " + training_status_obj.log,
            "download_uri": project_obj.download_uri,
            "success_rate": success_rate,
            "inference_num": inference_num,
            "unidentified_num": unidentified_num,
            "gpu": is_gpu,
            "average_time": average_inference_time,
            "count": last_prediction_count
        })

    @swagger_auto_schema(
        operation_summary='Train the project then deploy to Inference',
        responses={'200': SimpleStatusSerializer})
    @action(detail=True, methods=["get"])
    def configure(self, request, pk=None) -> Response:
        """configure.
        Train/Export/Deploy a part_detection_obj.
        """
        queryset = self.get_queryset()
        instance = get_object_or_404(queryset, pk=pk)
        # is_demo = request.query_params.get("demo")
        # if project is demo, let training status go to ok and should go on.
        for attr in ["inference_module", "camera", "project"]:
            if not hasattr(instance, attr) or getattr(instance, attr) is None:
                return Response(
                    {
                        "status":
                            "failed",
                        "log":
                            f"Part Detection must given a {attr} to configure."
                    },
                    status=status.HTTP_400_BAD_REQUEST)
        upcreate_training_status(project_id=instance.project.id,
                                 **progress.PROGRESS_1_FINDING_PROJECT)
        instance.has_configured = True
        instance.save()
        train_project_helper(project_id=instance.project.id)
        update_train_status_helper(project_id=instance.project.id)
        if_trained_then_deploy_helper(part_detection_id=instance.id)
        return Response({'status': 'ok'})

    @swagger_auto_schema(operation_summary='Upload a relabel image',
                         request_body=UploadRelabelSerializer())
    @action(detail=True, methods=["post"])
    def upload_relabel_image(self, request, pk=None) -> Response:
        """upload_relabel_image.

        Args:
            request:
        """
        queryset = self.get_queryset()
        instance = get_object_or_404(queryset, pk=pk)
        serializer = UploadRelabelSerializer(data=request.data)

        # FIXME: Inferenece should send part id instead of part_name
        if serializer.is_valid(raise_exception=True):
            pass
        part = get_object_or_404(instance.parts,
                                 name=serializer.validated_data["part_name"])

        project_obj = instance.project
        if project_obj is None:
            logger.error("Cannot found project objects")
            return Response(
                {
                    "status": "failed",
                    "log": "Cannot found project objects"
                },
                status=status.HTTP_400_BAD_REQUEST)

        # Relabel images count does not exceed project.maxImages
        # Handled by signals

        confidence_float = serializer.validated_data["confidence"] * 100
        # Confidence check
        if (confidence_float < instance.accuracyRangeMin or \
             confidence_float > instance.accuracyRangeMax):
            logger.error("Inferenece confidence %s out of range",
                         confidence_float)
            logger.error("range %s ~ %s", instance.accuracyRangeMin,
                         instance.accuracyRangeMax)

            return Response(
                {
                    "status": "failed",
                    'log': 'Confidence out of range',  # yapf...
                },
                status=status.HTTP_400_BAD_REQUEST)

        # Relabel images count does not exceed project.maxImages
        if project_obj.maxImages > Image.objects.filter(
                project=project_obj, part=part, is_relabel=True).count():
            img_io = serializer.validated_data["img"].file

            img = ImageFile(img_io)
            img.name = str(timezone.now()) + ".jpg"
            img_obj = Image(
                image=img,
                part_id=part.id,
                camera=instance.camera,
                labels=serializer.validated_data["labels"],
                confidence=serializer.validated_data["confidence"],
                project=instance.project,
                is_relabel=True,
            )
            img_obj.save()
            return Response({"status": "ok"})

        # User is not relabling and exceed maxImages
        # queue...
        logger.info(project_obj.relabel_expired_time)
        logger.info(timezone.now())
        if project_obj.relabel_expired_time < timezone.now():

            logger.info("Queuing relabel images...")
            img_io = serializer.validated_data["img"].file
            img = ImageFile(img_io)
            img.name = str(timezone.now()) + ".jpg"
            img_obj = Image(
                image=img,
                camera=instance.camera,
                part_id=part.id,
                labels=serializer.validated_data["labels"],
                confidence=serializer.validated_data["confidence"],
                project=project_obj,
                is_relabel=True,
            )
            img_obj.save()
            # pop
            earliest_img = Image.objects.filter(
                project=project_obj, part=part,
                is_relabel=True).order_by("timestamp").first()
            if earliest_img is not None:
                earliest_img.delete()
            return Response({"status": "ok"})
            # pop image

        # User is relabeling and exceed maxImages
        for _ in range(
                Image.objects.filter(
                    project=project_obj, part=part, is_relabel=True).count() -
                project_obj.maxImages):
            Image.objects.filter(
                project=project_obj, part=part,
                is_relabel=True).order_by("timestamp").last().delete()

        return Response(
            {
                "status": "failed",
                'log': 'Already reach project maxImages limit while labeling'
            },
            status=status.HTTP_400_BAD_REQUEST)