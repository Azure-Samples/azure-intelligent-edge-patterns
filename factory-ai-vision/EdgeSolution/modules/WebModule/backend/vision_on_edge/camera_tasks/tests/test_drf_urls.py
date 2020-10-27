"""App drf url tests.
"""

import pytest
from django.urls import resolve, reverse

from .factories import CameraTaskFactory

pytestmark = pytest.mark.django_db


def test_part_detection_detail(part_detection):
    """test_part_detection_detail."""
    assert (
        reverse("api:CameraTask-detail", kwargs={"pk": part_detection.id})
        == f"/api/part_detections/{part_detection.id}"
    )
    assert (
        resolve(f"/api/part_detections/{part_detection.id}").view_name
        == "api:CameraTask-detail"
    )


def test_part_detection_list():
    """test_part_detection_list."""
    assert reverse("api:CameraTask-list") == "/api/part_detections"
    assert resolve("/api/part_detections").view_name == "api:CameraTask-list"
