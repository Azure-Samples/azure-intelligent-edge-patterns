"""App views."""

from __future__ import absolute_import, unicode_literals

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets

from ..models import Part
from .serializers import PartSerializer


# pylint: disable=too-many-ancestors
class PartViewSet(FiltersMixin, viewsets.ModelViewSet):
    """PartViewSet.

    Args:
        partname (str): unique

    Filters:
        is_demo (bool)
    """

    queryset = Part.objects.all()
    serializer_class = PartSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        "is_demo": "is_demo",
    }


# pylint: enable=too-many-ancestors
