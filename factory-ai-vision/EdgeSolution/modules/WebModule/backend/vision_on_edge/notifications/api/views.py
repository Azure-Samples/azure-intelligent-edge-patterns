"""
Notification Views
"""

# from rest_framework.response import Response
from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets

from ..models import Notification
from .serializers import NotificationSerializer

from rest_framework.decorators import api_view


class NotificationViewSet(FiltersMixin, viewsets.ModelViewSet):
    """
    Notification ModelViewSet
    """

    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        "id": "id",
    }

# FIXME Peter please find a better way to put this
@api_view(['DELETE'])
def delete_all(request):
    Notification.objects.all().delete()
