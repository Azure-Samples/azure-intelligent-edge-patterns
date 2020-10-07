"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import logging

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets

from ..models import Camera
from .serializers import CameraSerializer

logger = logging.getLogger(__name__)


# pylint: disable=too-many-ancestors
class CameraViewSet(FiltersMixin, viewsets.ModelViewSet):
    """
    Camera ModelViewSet

    Available filters:
    @is_demo
    """

    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        "is_demo": "is_demo",
    }
