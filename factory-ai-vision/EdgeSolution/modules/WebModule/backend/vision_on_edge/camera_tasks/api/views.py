"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import logging

from rest_framework import filters, viewsets

from ..models import CameraTask
from .serializers import CameraTaskSerializer

logger = logging.getLogger(__name__)


class CameraTaskViewSet(viewsets.ModelViewSet):
    """CameraTask ModelViewSet"""

    queryset = CameraTask.objects.all()
    serializer_class = CameraTaskSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {"inference_module": "inference_module", "project": "project"}
