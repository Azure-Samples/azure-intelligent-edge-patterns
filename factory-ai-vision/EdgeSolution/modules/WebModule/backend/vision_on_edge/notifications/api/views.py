"""
Notification Views
"""

# from rest_framework.response import Response
from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets

from ..models import Notification
from .serializers import NotificationSerializer


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
