"""App views."""

from __future__ import absolute_import, unicode_literals

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets

from ..models import Part
from .serializers import PartSerializer
from rest_framework.response import Response

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

    def destroy(self, request,*args, **kwargs):
        if Part.objects.filter(pk=kwargs['pk']).exists():
            part_obj = Part.objects.get(pk=kwargs['pk'])
            part_obj.delete_on_customvision = True
            part_obj.delete()

        return Response(status=204)


# pylint: enable=too-many-ancestors
