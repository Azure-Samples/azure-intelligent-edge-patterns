"""
Notification Views
"""

import logging

from filters.mixins import FiltersMixin
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)


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

    @action(detail=False, methods=["delete"])
    def delete_all(self, request) -> Response:
        """delete_all.

        Args:
            request:

        Returns:
            Response: HTTP_204_NO_CONTENT
        """
        noti_objs = self.queryset.all()
        if noti_objs.exists():
            noti_objs.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
