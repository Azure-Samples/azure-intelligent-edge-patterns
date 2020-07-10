"""
Part views
"""
from __future__ import absolute_import, unicode_literals

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets

from ..models import Part
from .serializers import PartSerializer


class PartViewSet(FiltersMixin, viewsets.ModelViewSet):
    """
    Part ModelViewSet.Partname should be unique.

    Available filters:
    @is_demo
    """

    queryset = Part.objects.all()
    serializer_class = PartSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        "is_demo": "is_demo",
    }
