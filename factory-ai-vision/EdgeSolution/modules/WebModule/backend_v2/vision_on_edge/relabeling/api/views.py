# -*- coding: utf-8 -*-
"""Relabel views
"""

import base64
import datetime
import io
import logging

from django.core.files.images import ImageFile
from django.utils import timezone
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ...azure_part_detections.models import PartDetection
from ...azure_parts.models import Part
from ...cameras.models import Camera
from ...images.models import Image
from .serializers import UploadRelabelSerializer

logger = logging.getLogger(__name__)
