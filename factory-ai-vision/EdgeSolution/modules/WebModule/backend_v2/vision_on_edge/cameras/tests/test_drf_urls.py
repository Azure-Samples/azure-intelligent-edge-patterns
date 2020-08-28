# -*- coding: utf-8 -*-
"""DRF url tests
"""

import pytest
from django.urls import resolve, reverse

from ..models import Camera

pytestmark = pytest.mark.django_db


def test_view_detail(camera: Camera):
    """test_view_detail.

    Args:
        camera (Camera): camera
    """
    assert (reverse("api:camera-detail",
                    kwargs={"pk": camera.id
                           }) == f"/api/cameras/{camera.id}")
    assert resolve(
        f"/api/cameras/{camera.id}").view_name == "api:camera-detail"


def test_view_list():
    """test_view_list.
    """
    assert reverse("api:camera-list") == "/api/cameras"
    assert resolve("/api/cameras").view_name == "api:camera-list"
