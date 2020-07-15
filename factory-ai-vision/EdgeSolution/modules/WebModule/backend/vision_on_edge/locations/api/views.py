"""
Location Views
"""

# from rest_framework.response import Response
from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets

from ..models import Location
from .serializers import LocationSerializer


# pylint: disable=too-many-ancestors
class LocationViewSet(FiltersMixin, viewsets.ModelViewSet):
    """
    Location ModelViewSet

    @Available filters
    is_demo
    """

    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        "is_demo": "is_demo",
    }


# pylint: enable=too-many-ancestors
