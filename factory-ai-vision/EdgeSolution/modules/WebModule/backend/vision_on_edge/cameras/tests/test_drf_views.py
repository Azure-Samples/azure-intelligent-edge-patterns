"""App drf view tests.
"""
import json

import pytest
from rest_framework import status
from rest_framework.test import APIRequestFactory

from ..api.serializers import CameraSerializer
from ..api.views import CameraViewSet
from .factories import CameraFactory

pytestmark = pytest.mark.django_db


@pytest.mark.fast
def test_get(monkeypatch, mock_cv2_capture):
    """test_get_queryset."""
    factory = APIRequestFactory()

    cam_1 = CameraFactory()
    camera_list_view = CameraViewSet.as_view({"get": "list"})
    request = factory.get("/fake-url/")

    response = camera_list_view(request).render()
    response_body = response.content.decode("utf-8")
    assert CameraSerializer(cam_1).data in json.loads(response_body)
    assert response.status_code == status.HTTP_200_OK
