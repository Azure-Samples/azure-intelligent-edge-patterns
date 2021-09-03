"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import logging

import requests
import json
from django.core.files.images import ImageFile
from django.utils import timezone
from drf_yasg2 import openapi
from drf_yasg2.utils import swagger_auto_schema
from filters.mixins import FiltersMixin
from requests.exceptions import ReadTimeout
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ...azure_pd_deploy_status.models import DeployStatus
from ...azure_projects.utils import TRAINING_MANAGER
from ...azure_training_status import progress
from ...azure_training_status.utils import upcreate_training_status
from ...general.api.serializers import (
    MSStyleErrorResponseSerializer,
    SimpleOKSerializer,
)
from ...general.shortcuts import drf_get_object_or_404
from ...images.models import Image
from ..exceptions import (
    PdExportCameraRemoved,
    PdExportInfereceReadTimeout,
    PdInferenceModuleUnreachable,
    PdProbThresholdNotInteger,
    PdProbThresholdOutOfRange,
    PdRelabelConfidenceOutOfRange,
    PdRelabelDemoProjectError,
    PdRelabelImageFull,
    PdRelabelWithoutProject,
)
from ..models import PartDetection, PDScenario
from ..utils import if_trained_then_deploy_helper
from .serializers import (
    ExportSerializer,
    PartDetectionSerializer,
    PDScenarioSerializer,
    UploadRelabelSerializer,
)

logger = logging.getLogger(__name__)


class PartDetectionViewSet(FiltersMixin, viewsets.ModelViewSet):
    """PartDetection ModelViewSet"""

    queryset = PartDetection.objects.all()
    serializer_class = PartDetectionSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {"inference_module": "inference_module", "project": "project"}

    @swagger_auto_schema(
        operation_summary="Update Probability Threshold.",
        manual_parameters=[
            openapi.Parameter(
                "prob_threshold",
                openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                description="Probability Threshold",
                required=True,
            )
        ],
        responses={"200": SimpleOKSerializer, "400": MSStyleErrorResponseSerializer},
    )
    @action(detail=True, methods=["get"])
    def update_prob_threshold(self, request, pk=None) -> Response:
        """update inference bounding box threshold."""
        queryset = self.get_queryset()
        part_detection_obj = drf_get_object_or_404(queryset, pk=pk)
        prob_threshold = request.query_params.get("prob_threshold")

        try:
            prob_threshold = int(prob_threshold)
        except Exception as err:
            raise PdProbThresholdNotInteger from err

        if prob_threshold > 100 or prob_threshold < 0:
            raise PdProbThresholdOutOfRange

        part_detection_obj.update_prob_threshold(prob_threshold=prob_threshold)
        return Response({"status": "ok"})

    @action(detail=True, methods=["get"])
    def update_max_people(self, request, pk=None) -> Response:
        """update inference max people threshold."""
        queryset = self.get_queryset()
        part_detection_obj = drf_get_object_or_404(queryset, pk=pk)
        max_people = request.query_params.get("max_people")

        try:
            max_people = int(max_people)
        except Exception as err:
            raise PdProbThresholdNotInteger from err

        part_detection_obj.update_max_people(max_people=max_people)
        return Response({"status": "ok"})

    @swagger_auto_schema(
        operation_summary="Export Part Detection status.",
        manual_parameters=[
            openapi.Parameter(
                "camera_id",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="Camera ID",
                required=True,
            )
        ],
        responses={
            "200": ExportSerializer,
            "400": MSStyleErrorResponseSerializer,
            "503": MSStyleErrorResponseSerializer,
        },
    )
    @action(detail=True, methods=["get"])
    def export(self, request, pk=None) -> Response:
        """get the status of train job sent to custom vision"""
        queryset = self.get_queryset()
        instance = drf_get_object_or_404(queryset, pk=pk)
        cam_id = request.query_params.get("camera_id")

        # Related objects
        project_obj = instance.project
        deploy_status_obj = DeployStatus.objects.get(part_detection=instance)
        inference_module_obj = instance.inference_module
        try:
            drf_get_object_or_404(instance.cameras.all(), pk=cam_id)
        except Exception as e:
            raise PdExportCameraRemoved from e

        success_rate = 0.0
        inference_num = 0
        unidentified_num = 0
        try:
            device = inference_module_obj.device()
        except requests.exceptions.ConnectionError as err:
            raise PdInferenceModuleUnreachable from err
        except ReadTimeout as err:
            raise PdExportInfereceReadTimeout from err

        if deploy_status_obj.status != "ok":
            return Response(
                {
                    "status": deploy_status_obj.status,
                    "log": "Status: " + deploy_status_obj.log,
                    "download_uri": "",
                    "success_rate": 0.0,
                    "inference_num": 0,
                    "unidentified_num": 0,
                    "device": device,
                    "count": 0,
                    "average_time": 0.0,
                    "scenario_metrics": [],
                }
            )
        try:
            res = requests.get(
                "http://" + inference_module_obj.url + "/metrics",
                params={"cam_id": cam_id},
                timeout=5,
            )
            data = res.json()
            success_rate = int(data["success_rate"] * 100) / 100
            inference_num = data["inference_num"]
            device = inference_module_obj.device()
            unidentified_num = data["unidentified_num"]
            average_inference_time = data["average_inference_time"]
            last_prediction_count = data["last_prediction_count"]
            scenario_metrics = data["scenario_metrics"] or []
        except requests.exceptions.ConnectionError as err:
            raise PdInferenceModuleUnreachable from err
        except ReadTimeout as err:
            raise PdExportInfereceReadTimeout from err
        deploy_status_obj.save()
        logger.info(
            "Deploy status: %s, %s", deploy_status_obj.status, deploy_status_obj.log
        )
        if project_obj is None:
            download_uri = ""
        else:
            download_uri = project_obj.download_uri
        return Response(
            {
                "status": deploy_status_obj.status,
                "log": "Status: " + deploy_status_obj.log,
                "download_uri": download_uri,
                "success_rate": success_rate,
                "inference_num": inference_num,
                "unidentified_num": unidentified_num,
                "device": device,
                "count": last_prediction_count,
                "average_time": average_inference_time,
                "scenario_metrics": scenario_metrics,
            }
        )

    @swagger_auto_schema(
        operation_summary="Train the project then deploy to Inference Module.",
        responses={"200": SimpleOKSerializer, "400": MSStyleErrorResponseSerializer},
    )
    @action(detail=True, methods=["get"])
    def configure(self, request, pk=None) -> Response:
        """configure.

        Train/Export/Deploy a part_detection_obj.
        """
        queryset = self.get_queryset()
        instance = drf_get_object_or_404(queryset, pk=pk)
        if instance.deployment_type == 'model':
            instance.is_deployable(raise_exception=True)

            upcreate_training_status(
                project_id=instance.project.id, **progress.PROGRESS_1_FINDING_PROJECT
            )
            instance.has_configured = True
            instance.save()

            TRAINING_MANAGER.add(project_id=instance.project.id)
            if_trained_then_deploy_helper(part_detection_id=instance.id)
        else:
            instance.has_configured = True
            instance.save()
        return Response({"status": "ok"})

    @swagger_auto_schema(
        operation_summary="Upload a relabel image.",
        request_body=UploadRelabelSerializer(),
    )
    @action(detail=True, methods=["post"])
    def upload_relabel_image(self, request, pk=None) -> Response:
        """upload_relabel_image.

        Args:
            request:
        """
        queryset = self.get_queryset()
        instance = drf_get_object_or_404(queryset, pk=pk)
        serializer = UploadRelabelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # FIXME: Inferenece should send part id instead of part_name
        part = drf_get_object_or_404(
            instance.parts, name=serializer.validated_data["part_name"]
        )
        drf_get_object_or_404(
            instance.cameras, pk=serializer.validated_data["camera_id"]
        )

        project_obj = instance.project
        if project_obj is None:
            raise PdRelabelWithoutProject

        if project_obj.is_demo:
            raise PdRelabelDemoProjectError

        # Relabel images count does not exceed project.maxImages
        # Handled by signals

        confidence_float = serializer.validated_data["confidence"] * 100
        # Confidence check
        if (
            confidence_float < instance.accuracyRangeMin
            or confidence_float > instance.accuracyRangeMax
        ):
            logger.error("Inferenece confidence %s out of range", confidence_float)
            raise PdRelabelConfidenceOutOfRange

        # Relabel images count does not exceed project.maxImages
        if (
            instance.maxImages
            > Image.objects.filter(
                project=project_obj, part_ids__contains='"{}"'.format(str(part.id)), is_relabel=True
            ).count()
        ):
            img_io = serializer.validated_data["img"].file

            img = ImageFile(img_io)
            img.name = str(timezone.now()) + ".jpg"
            labels = json.loads(serializer.validated_data["labels"])
            labels[0]['part'] = part.id
            part_ids = [str(part.id)]
            img_obj = Image(
                image=img,
                part_id=part.id,
                part_ids=json.dumps(part_ids),
                camera_id=serializer.validated_data["camera_id"],
                labels=json.dumps(labels),
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
            labels = json.loads(serializer.validated_data["labels"])
            labels[0]['part'] = part.id
            part_ids = [str(part.id)]
            img_obj = Image(
                image=img,
                camera_id=serializer.validated_data["camera_id"],
                part_id=part.id,
                part_ids=json.dumps(part_ids),
                labels=json.dumps(labels),
                confidence=serializer.validated_data["confidence"],
                project=project_obj,
                is_relabel=True,
            )
            img_obj.save()
            # pop
            earliest_img = (
                Image.objects.filter(project=project_obj, part_ids__contains='"{}"'.format(
                    str(part.id)), is_relabel=True)
                .order_by("timestamp")
                .first()
            )
            if earliest_img is not None:
                earliest_img.delete()
            return Response({"status": "ok"})
            # pop image

        # User is relabeling and exceed maxImages
        for _ in range(
            Image.objects.filter(
                project=project_obj, part_ids__contains='"{}"'.format(str(part.id)), is_relabel=True
            ).count()
            - instance.maxImages
        ):
            Image.objects.filter(
                project=project_obj, part_ids__contains='"{}"'.format(str(part.id)), is_relabel=True
            ).order_by("timestamp").last().delete()
        raise PdRelabelImageFull


class PDScenarioViewSet(viewsets.ReadOnlyModelViewSet):
    """PDScenario ModelViewSet"""

    queryset = PDScenario.objects.all()
    serializer_class = PDScenarioSerializer
