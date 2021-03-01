"""App drf view tests.
"""

import json

import pytest
from rest_framework.test import APIRequestFactory

from ..api.serializers import PartDetectionSerializer
from ..api.views import PartDetectionViewSet

pytestmark = pytest.mark.django_db


def test_get(part_detection):
    """test_get_queryset.

    Args:
        part_detection (Part Detection): part_detection instance
    """
    factory = APIRequestFactory()
    pd_list_view = PartDetectionViewSet.as_view({"get": "list"})
    request = factory.get("/fake-url/")

    response = pd_list_view(request).render()
    response_body = response.content.decode("utf-8")

    assert PartDetectionSerializer(part_detection).data in json.loads(response_body)


def test_put_from_frontend(part_detection):
    data = {
        "parts": [part.id for part in part_detection.parts.all()],
        "cameras": [cam.id for cam in part_detection.cameras.all()],
        "project": part_detection.project.id,
        "needRetraining": True,
        "accuracyRangeMin": 60,
        "accuracyRangeMax": 80,
        "maxImages": 20,
        "metrics_is_send_iothub": False,
        "metrics_frame_per_minutes": 6,
        "name": "New Task ",
        "send_video_to_cloud": False,
        "inference_mode": "PD",
        "fps": 10,
        "inference_protocol": "grpc",
    }
    factory = APIRequestFactory()
    pd_list_view = PartDetectionViewSet.as_view({"put": "update"})
    request = factory.put("/fake-url/", data=data)

    response = pd_list_view(request, pk=part_detection.id).render()
    assert response.status_code == 200


def test_put_from_frontend_1(part_detection):
    data = {
        "parts": [part.id for part in part_detection.parts.all()],
        "cameras": [cam.id for cam in part_detection.cameras.all()],
        "project": part_detection.project.id,
        "needRetraining": True,
        "accuracyRangeMin": 60,
        "accuracyRangeMax": 80,
        "maxImages": 20,
        "metrics_is_send_iothub": False,
        "metrics_frame_per_minutes": 6,
        "name": "New Task ",
        "send_video_to_cloud": [{"camera_id": 0, "send_video_to_cloud": False}],
        "inference_mode": "PD",
        "fps": 10,
        "inference_protocol": "grpc",
    }
    factory = APIRequestFactory()
    pd_list_view = PartDetectionViewSet.as_view({"put": "update"})
    request = factory.put("/fake-url/", data=data)

    response = pd_list_view(request, pk=part_detection.id).render()
    assert response.status_code == 200
