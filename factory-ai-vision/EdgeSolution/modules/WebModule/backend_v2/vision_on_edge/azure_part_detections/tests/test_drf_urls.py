"""App drf url tests.
"""

import pytest
from django.urls import resolve, reverse

from ..models import PartDetection

pytestmark = pytest.mark.django_db


def test_part_detection_detail(part_detection: PartDetection):
    """test_part_detection_detail.

    Args:
        part_detection (PartDetection): part_detection
    """
    assert (
        reverse("api:partdetection-detail", kwargs={"pk": part_detection.id})
        == f"/api/part_detections/{part_detection.id}"
    )
    assert (
        resolve(f"/api/partdetections/{part_detection.id}").view_name
        == "api:partdetection-detail"
    )


def test_part_detection_list():
    """test_part_detection_list."""
    assert reverse("api:partdetection-list") == "/api/part_detections"
    assert resolve("/api/part_detections").view_name == "api:partdetection-list"
