"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import logging

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets

from ..models import DeployStatus
from .serializers import DeployStatusSerializer

logger = logging.getLogger(__name__)


class DeployStatusViewSet(FiltersMixin, viewsets.ReadOnlyModelViewSet):
    """TrainingStatusViewSet.

    Filters:
        project_id
    """

    queryset = DeployStatus.objects.all()
    serializer_class = DeployStatusSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {"part_detection_id": "part_detection__id"}
