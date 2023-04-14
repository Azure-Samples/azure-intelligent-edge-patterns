"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import logging

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError

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

    @action(detail=False, methods=["delete"], url_path="bulk-delete")
    def bulk_delete(self, request):
        logger.warning(request)
        logger.warning(request.query_params)
        ids = request.query_params.getlist('id', None)
        if not ids:
            raise ValidationError("Not providing ids data")
        # this would not trigger pre/post delete, get instance and delete if needed
        Camera.objects.filter(id__in=ids).all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)