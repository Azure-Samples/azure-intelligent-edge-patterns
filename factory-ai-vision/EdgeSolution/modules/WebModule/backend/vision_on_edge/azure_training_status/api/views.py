"""App views
"""

from __future__ import absolute_import, unicode_literals

import logging

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets

from ..models import TrainingStatus
from .serializers import TrainingStatusSerializer

logger = logging.getLogger(__name__)


class TrainingStatusViewSet(FiltersMixin, viewsets.ModelViewSet):
    """TrainingStatusViewSet.

    Filters:
        project_id
    """

    queryset = TrainingStatus.objects.all()
    serializer_class = TrainingStatusSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {"project_id": "project__id"}
