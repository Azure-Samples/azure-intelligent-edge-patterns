# -*- coding: utf-8 -*-
"""App views"""

from __future__ import absolute_import, unicode_literals

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

from ...azure_iot.utils import inference_module_url
from ...azure_projects.models import Project
from ...azure_parts.models import Part
from ...azure_parts.utils import batch_upload_parts_to_customvision
from ...azure_training_status import constants as progress_constants
from ...azure_training_status.models import TrainingStatus
from ...azure_training_status.utils import upcreate_training_status
from ...cameras.models import Camera
from ...general import error_messages
from ...general.utils import normalize_rtsp
from ...images.models import Image
from ...images.utils import upload_images_to_customvision_helper
from ..models import PartDetection
from .serializers import PartDetectionSerializer

logger = logging.getLogger(__name__)

PROJECT_RELABEL_TIME_THRESHOLD = 30  # Seconds


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
    }

@api_view()
def update_prob_threshold(request, project_id):
    """update inference bounding box threshold"""
    prob_threshold = request.query_params.get("prob_threshold")
    project_obj = Project.objects.filter(pk=project_id).first()

    if prob_threshold is None:
        return Response(
            {
                'status': 'failed',
                'log': 'prob_threshold must be given as Integer'
            },
            status=status.HTTP_400_BAD_REQUEST)

    if project_obj is None:
        return Response(
            {
                'status': 'failed',
                'log': 'project with project_id not found'
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
        project_obj.update_prob_threshold(prob_threshold=prob_threshold)
        return Response({'status': 'ok'})
    except ValueError:
        return Response(
            {
                'status': 'failed',
                'log': 'prob_threshold must be given as Integer'
            },
            status=status.HTTP_400_BAD_REQUEST)
