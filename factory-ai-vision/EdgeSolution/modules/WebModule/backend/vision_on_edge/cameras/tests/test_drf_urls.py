"""App drf url tests.
"""

import pytest
from django.urls import resolve, reverse

from .factories import CameraFactory

pytestmark = pytest.mark.django_db


@pytest.mark.fast
def test_view_detail(monkeypatch, mock_cv2_capture):
    """test_view_detail.

    Args:
        camera (Camera): camera
    """

    cam_1 = CameraFactory()
    cam_1.save()
    assert (
        reverse("api:camera-detail", kwargs={"pk": cam_1.id})
        == f"/api/cameras/{cam_1.id}"
    )
    assert resolve(f"/api/cameras/{cam_1.id}").view_name == "api:camera-detail"


@pytest.mark.fast
def test_view_list():
    """test_view_list."""
    assert reverse("api:camera-list") == "/api/cameras"
    assert resolve("/api/cameras").view_name == "api:camera-list"
