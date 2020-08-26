# -*- coding: utf-8 -*-
"""App views"""

from __future__ import absolute_import, unicode_literals

import logging

import requests
from django.shortcuts import get_object_or_404
from filters.mixins import FiltersMixin
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ...azure_training_status.models import TrainingStatus
from ..models import PartDetection
from .serializers import PartDetectionSerializer
from ..utils import if_trained_then_deploy_helper

logger = logging.getLogger(__name__)


class PartDetectionViewSet(FiltersMixin, viewsets.ModelViewSet):
    """Project ModelViewSet

    Filters:
        is_demo
    """

    queryset = PartDetection.objects.all()
    serializer_class = PartDetectionSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        "is_demo": "is_demo",
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
                part_detection_obj.inference_module_url.url,
            )
            return Response(
                {
                    "status":
                        "failed",
                    "log":
                        "Export failed. Inference module url: " +
                        part_detection_obj.inference_module.url +
                        "unreachable",
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

    @action(detail=True, methods=["get"])
    def configure(self, request, pk=None) -> Response:
        """configure.
        Train/Export/Deploy a part_detection_obj.
        """
        queryset = self.get_queryset()
        part_detection_obj = get_object_or_404(queryset, pk=pk)
        # is_demo = request.query_params.get("demo")
        # if project is demo, let training status go to ok and should go on.
        train_project_helper(project_id, parts)
        if_trained_then_deploy_helper(part_detection_id=part_detection_obj.id)
        return Response({'status': 'ok'})
