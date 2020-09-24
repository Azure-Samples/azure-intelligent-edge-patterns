"""Test drf views
"""

import json

import pytest
from rest_framework import status
from rest_framework.test import APIRequestFactory

from vision_on_edge.notifications.api.serializers import NotificationSerializer
from vision_on_edge.notifications.api.views import NotificationViewSet
from vision_on_edge.notifications.models import Notification

pytestmark = pytest.mark.django_db


class TestNotificationViewSet:
    """TestNotificationViewSet."""

    def test_get(self, notification: Notification, rf: APIRequestFactory):
        """test_get_queryset.

        Args:
            notification (Notification): notification
            rf (APIRequestFactory): rf
        """
        notification_list_view = NotificationViewSet.as_view({"get": "list"})
        request = rf.get("/fake-url/")

        response = notification_list_view(request).render().content.decode("utf-8")

        assert NotificationSerializer(notification).data in json.loads(response)
