"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import datetime
import logging
from distutils.util import strtobool
import json

from azure.cognitiveservices.vision.customvision.training.models import (
    CustomVisionErrorException,
)
from django.utils import timezone
from drf_yasg2 import openapi
from drf_yasg2.utils import swagger_auto_schema
from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response


from ...azure_settings.exceptions import SettingCustomVisionAccessFailed
from ...general.api.serializers import (
    MSStyleErrorResponseSerializer,
    SimpleOKSerializer,
)
from ...general.shortcuts import drf_get_object_or_404
from ..exceptions import ProjectWithoutSettingError
from ..models import Project, Task
from ..utils import TRAINING_MANAGER, pull_cv_project_helper, create_cv_project_helper, update_tags_helper
from .serializers import (
    IterationPerformanceSerializer,
    ProjectPerformanesSerializer,
    ProjectSerializer,
    TaskSerializer,
    CreateCVProjectSerializer,
    UpdateTagSerializer,
)
from ..ovms_config_utils import create_config


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
    filter_mappings = {"is_demo": "is_demo"}

    @swagger_auto_schema(operation_summary="Keep relabel alive.")
    @action(detail=True, methods=["post"])
    def relabel_keep_alive(self, request, pk=None) -> Response:
        """relabel_keep_alive."""
        queryset = self.get_queryset()
        instance = drf_get_object_or_404(queryset, pk=pk)
        instance.relabel_expired_time = timezone.now() + datetime.timedelta(
            seconds=PROJECT_RELABEL_TIME_THRESHOLD
        )
        instance.save(update_fields=["relabel_expired_time"])
        serializer = ProjectSerializer(instance)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_summary="Get training performace from Custom Vision.",
        responses={
            "200": ProjectPerformanesSerializer,
            "400": MSStyleErrorResponseSerializer,
        },
    )
    @action(detail=True, methods=["get"])
    def train_performance(self, request, pk=None) -> Response:
        """train_performance."""
        queryset = self.get_queryset()
        project_obj = drf_get_object_or_404(queryset, pk=pk)
        if project_obj.setting is None:
            raise ProjectWithoutSettingError
        if not project_obj.setting.is_trainer_valid:
            raise SettingCustomVisionAccessFailed

        trainer = project_obj.setting.get_trainer_obj()
        customvision_project_id = project_obj.customvision_id

        res_data: dict = {"iterations": []}

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
                    customvision_project_id, iteration["id"]
                ).as_dict()
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
            iteration_serialzer = IterationPerformanceSerializer(data=iteration_data)
            if iteration_serialzer.is_valid(raise_exception=True):
                res_data["iterations"].append(iteration_serialzer.data)
            project_performance_serializer = ProjectPerformanesSerializer(data=res_data)
        else:
            iterations = trainer.get_iterations(customvision_project_id)
            for i in range(min(2, len(iterations))):
                iteration_data = _parse(
                    iterations[i], iteration_name=("new" if i == 0 else "previous")
                )
                iteration_serialzer = IterationPerformanceSerializer(
                    data=iteration_data
                )
                if iteration_serialzer.is_valid(raise_exception=True):
                    res_data["iterations"].append(iteration_serialzer.data)

        project_performance_serializer = ProjectPerformanesSerializer(data=res_data)
        if project_performance_serializer.is_valid(raise_exception=True):
            return Response(data=project_performance_serializer.data)

    @swagger_auto_schema(
        operation_summary="reset project",
        manual_parameters=[
            openapi.Parameter(
                "project_name",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="Project name",
                required=True,
            )
        ],
        responses={"200": ProjectSerializer, "400": MSStyleErrorResponseSerializer},
    )
    @action(detail=True, methods=["get"])
    def reset_project(self, request, pk=None) -> Response:
        """reset_project."""

        queryset = self.get_queryset()
        project_obj = drf_get_object_or_404(queryset, pk=pk)
        project_name = request.query_params.get("project_name") or None
        try:
            project_obj.reset(name=project_name)
            project_obj.save()
            # Let Signals to handle if we need to delete Part/Image
            serializer = ProjectSerializer(project_obj)
            return Response(serializer.data)
        except CustomVisionErrorException:
            raise SettingCustomVisionAccessFailed

    @action(detail=True, methods=["post"])
    def create_cv_project(self, request, pk=None) -> Response:
        """create_cv_project."""

        queryset = self.get_queryset()
        serializer = CreateCVProjectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Let Signals to handle if we need to delete Part/Image
            project_obj = create_cv_project_helper(name=serializer.validated_data["name"], tags=serializer.validated_data["tags"], project_type=serializer.validated_data["project_type"])
            serializer = ProjectSerializer(project_obj)
            return Response(serializer.data)
        except CustomVisionErrorException:
            raise SettingCustomVisionAccessFailed

    @action(detail=True, methods=["post"])
    def update_tags(self, request, pk=None) -> Response:
        """update cv/django parts"""
        queryset = self.get_queryset()
        project_obj = drf_get_object_or_404(queryset, pk=pk)
        serializer = UpdateTagSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            project_obj = update_tags_helper(project_id=project_obj.id, tags=serializer.validated_data["tags"])
            return Response({"status": "ok"})
        except CustomVisionErrorException:
            raise SettingCustomVisionAccessFailed

    @swagger_auto_schema(
        operation_summary="Pull a Custom Vision project.",
        manual_parameters=[
            openapi.Parameter(
                "customvision_project_id",
                openapi.IN_QUERY,
                type=openapi.TYPE_STRING,
                description="Custom Vision Id to Pull",
            ),
            openapi.Parameter(
                "partial",
                openapi.IN_QUERY,
                type=openapi.TYPE_BOOLEAN,
                description="partial download or not",
            ),
        ],
        responses={"200": SimpleOKSerializer, "400": MSStyleErrorResponseSerializer},
    )
    @action(detail=True, methods=["get"])
    def pull_cv_project(self, request, pk=None) -> Response:
        """pull_cv_project."""
        queryset = self.get_queryset()
        project_obj = drf_get_object_or_404(queryset, pk=pk)

        # Check Customvision Project id
        customvision_project_id = request.query_params.get("customvision_project_id")
        logger.info("Project customvision_id: %s", {customvision_project_id})

        # Check Partial
        try:
            is_partial = bool(strtobool(request.query_params.get("partial")))
        except Exception:
            is_partial = True

        # Pull Custom Vision Project
        pull_cv_project_helper(
            project_id=project_obj.id,
            customvision_project_id=customvision_project_id,
            is_partial=is_partial,
        )
        return Response({"status": "ok"})

    @swagger_auto_schema(
        operation_summary="Train project in background.",
        responses={"200": SimpleOKSerializer, "400": MSStyleErrorResponseSerializer},
    )
    @action(detail=True, methods=["get"])
    def train(self, request, pk=None) -> Response:
        """train."""
        queryset = self.get_queryset()
        project_obj = drf_get_object_or_404(queryset, pk=pk)
        project_obj.is_trainable(raise_exception=True)
        TRAINING_MANAGER.add(project_id=pk)
        return Response({"status": "ok"})

    @action(detail=True, methods=["post"])
    def get_default_ovms_model(self, request, pk=None) -> Response:
        """get default ovms model"""
        queryset = self.get_queryset()
        project_obj = drf_get_object_or_404(queryset, pk=pk)
        
        self.model_name = request.data['model_name']
        config = create_config(self.model_name)
        response_data = {}

        if config:
            response_data = {
                "model_name": self.model_name,
                "type": "ovms",
                "url": "ovms-server:9010"
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            response_data = {"status": "Model Dose Not Exist"}
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)


class TaskViewSet(FiltersMixin, viewsets.ModelViewSet):
    """Task ModelViewSet"""

    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {"project": "project"}
