"""DRF url tests
"""

import pytest
from django.urls import resolve, reverse

from ...images.models import Image

pytestmark = pytest.mark.django_db


def test_image_detail(image: Image):
    """test_image_detail.

    Args:
        image (Image): image
    """

    assert (
        reverse("api:image-detail", kwargs={"pk": image.id})
        == f"/api/images/{image.id}"
    )
    assert resolve(f"/api/images/{image.id}").view_name == "api:image-detail"


def test_image_list():
    """test_image_list."""
    assert reverse("api:image-list") == "/api/images"
    assert resolve("/api/images").view_name == "api:image-list"
