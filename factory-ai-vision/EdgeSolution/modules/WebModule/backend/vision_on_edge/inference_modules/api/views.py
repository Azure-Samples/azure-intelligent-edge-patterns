"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import logging

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets

from ..models import InferenceModule
from .serializers import InferenceModuleSerializer

logger = logging.getLogger(__name__)


# pylint: disable=too-many-ancestors
class InferenceModuleViewSet(FiltersMixin, viewsets.ModelViewSet):
    """InferenceModuleViewSet."""

    queryset = InferenceModule.objects.all()
    serializer_class = InferenceModuleSerializer
    filter_backends = (filters.OrderingFilter,)
