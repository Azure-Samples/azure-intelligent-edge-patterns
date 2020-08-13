"""Test drf views
"""
import json

import pytest
from rest_framework.test import APIRequestFactory

from vision_on_edge.notifications.api.views import NotificationViewSet
from vision_on_edge.notifications.models import Notification

pytestmark = pytest.mark.django_db

class TestNotificationViewSet:
    """TestNotificationViewSet.
    """

    def test_get_queryset(self, notification: Notification, rf: APIRequestFactory):
        """test_get_queryset.

        Args:
            notification (Notification): notification
            rf (APIRequestFactory): rf
        """
        notification_list_view = NotificationViewSet.as_view({'get': 'list'})
        request = rf.get("/fake-url/")
        
        #request.notification = notification

        #view.request = request
        response = notification_list_view(request).render().content.decode('utf-8')
        print(response)
        print(type(response))
        assert notification in json.loads(response)
