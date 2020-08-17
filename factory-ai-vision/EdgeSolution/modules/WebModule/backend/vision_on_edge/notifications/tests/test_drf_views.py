# -*- coding: utf-8 -*-
"""Test drf views
"""

import pytest
from rest_framework import status
from rest_framework.test import APIRequestFactory

from vision_on_edge.notifications.api.views import NotificationViewSet
from vision_on_edge.notifications.models import Notification

pytestmark = pytest.mark.django_db



def test_get_list():
    """test_get_list.
    """
    rf = APIRequestFactory()
    list_view = NotificationViewSet.as_view({'get': 'list'})
    response = list_view(rf.get(""))
    assert response.status_code == status.HTTP_200_OK

def test_get_detail(notification: Notification):
    rf = APIRequestFactory()
    detail_view = NotificationViewSet.as_view({'get': 'retrieve'})
    response = detail_view(rf.get(""), pk=notification.id)
    assert response.status_code == status.HTTP_200_OK
