"""App views.
"""

from __future__ import absolute_import, unicode_literals

from filters.mixins import FiltersMixin
from rest_framework import filters, status, viewsets
from rest_framework.response import Response

from ..models import Image
from .serializers import ImageSerializer


# pylint: disable=too-many-ancestors
class ImageViewSet(FiltersMixin, viewsets.ModelViewSet):
    """Image ModelViewSet."""

    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {"is_demo": "is_demo", "project_id": "project_id"}

    def get_queryset(self):
        project = self.request.query_params.get('project')
        if project:
            queryset = Image.objects.filter(project=project)
        else:
            queryset = Image.objects.all()
        return queryset

    def destroy(self, request, **kwargs):
        """destroy.

        Only delete image on customvision when api call.
        """
        if Image.objects.filter(pk=kwargs["pk"]).exists():
            img_obj = Image.objects.get(pk=kwargs["pk"])
            img_obj.delete_on_customvision = True
            img_obj.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
