"""App drf url tests.
"""

import pytest
from django.urls import resolve, reverse

from ...azure_parts.models import Part

pytestmark = pytest.mark.django_db


def test_part_detail(part: Part):
    """test_part_detail.

    Args:
        part (Part): part
    """
    part.save()

    assert reverse("api:part-detail", kwargs={"pk": part.id}) == f"/api/parts/{part.id}"
    assert resolve(f"/api/parts/{part.id}").view_name == "api:part-detail"


def test_part_list():
    """test_part_list."""
    assert reverse("api:part-list") == "/api/parts"
    assert resolve("/api/parts").view_name == "api:part-list"
