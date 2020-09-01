# -*- coding: utf-8 -*-
"""App views
"""

from __future__ import absolute_import, unicode_literals

import datetime
import logging
from distutils.util import strtobool

from azure.cognitiveservices.vision.customvision.training.models import \
    CustomVisionErrorException
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from filters.mixins import FiltersMixin
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ...exceptions.api_exceptions import CustomVisionAccessFailed
from ..models import Project, Task
from ..utils import (pull_cv_project_helper, train_project_helper,
                     update_train_status_helper)
from .serializers import (IterationPerformanceSerializer,
                          ProjectPerformanesSerializer, ProjectSerializer,
                          TaskSerializer)

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
                                               description='Project name',
                                               required=True),
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

            # Let Signals to handle if we need to delete Part/Image
            return Response({"status": "ok"})
        except CustomVisionErrorException:
            raise CustomVisionAccessFailed

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
        queryset = self.get_queryset()
        project_obj = get_object_or_404(queryset, pk=pk)

        # Check Customvision Project id
        customvision_project_id = request.query_params.get(
            "customvision_project_id")
        logger.info("Project customvision_id: %s", {customvision_project_id})

        # Check Partial
        try:
            is_partial = bool(strtobool(request.query_params.get("partial")))
        except Exception:
            is_partial = True

        # Pull Custom Vision Project
        pull_cv_project_helper(project_id=project_obj.id,
                               customvision_project_id=customvision_project_id,
                               is_partial=is_partial)
        return Response({"status": "ok"})

    @swagger_auto_schema(operation_summary='Train project in background.')
    @action(detail=True, methods=["get"])
    def train(self, request, pk=None) -> Response:
        """train.
        """
        queryset = self.get_queryset()
        project_obj = get_object_or_404(queryset, pk=pk)
        train_project_helper(project_id=project_obj.id)
        update_train_status_helper(project_id=project_obj.id)
        return Response({'status': 'ok'})


class TaskViewSet(FiltersMixin, viewsets.ModelViewSet):
    """Task ModelViewSet
    """

    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        "project": "project",
    }
