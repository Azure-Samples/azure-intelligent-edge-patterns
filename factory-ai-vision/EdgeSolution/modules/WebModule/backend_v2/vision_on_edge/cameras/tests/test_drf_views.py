# -*- coding: utf-8 -*-
"""Test drf views
"""

import json
from unittest import mock

import pytest
from rest_framework import status
from rest_framework.test import APIRequestFactory

from ..api.serializers import CameraSerializer
from ..api.views import CameraViewSet
from .factories import CameraFactory

pytestmark = pytest.mark.django_db


@pytest.mark.fast
@mock.patch("vision_on_edge.cameras.models.Camera.verify_rtsp",
            mock.MagicMock(return_value=True))
def test_get():
    """test_get_queryset.
    """
    factory = APIRequestFactory()
    cam_1 = CameraFactory()
    camera_list_view = CameraViewSet.as_view({'get': 'list'})
    request = factory.get("/fake-url/")

    response = camera_list_view(request).render()
    assert CameraSerializer(cam_1).data in json.loads(
        response.content.decode('utf-8'))
    assert response.status_code == status.HTTP_200_OK
