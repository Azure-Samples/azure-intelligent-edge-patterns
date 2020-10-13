"""App views.
"""

from __future__ import absolute_import, unicode_literals

from filters.mixins import FiltersMixin
from rest_framework import filters, status, viewsets
from rest_framework.response import Response

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
    filter_mappings = {"is_demo": "project__is_demo", "project_id": "project_id"}

    def destroy(self, request, **kwargs):
        """destroy.

        only delete image on customvision when api_call
        """
        if Part.objects.filter(pk=kwargs["pk"]).exists():
            part_obj = Part.objects.filter(pk=kwargs["pk"]).get()
            part_obj.delete_on_customvision = True
            part_obj.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
