"""App drf url tests
"""

import pytest
from django.urls import resolve, reverse

from ...locations.models import Location

pytestmark = pytest.mark.django_db


def test_location_detail(location: Location):
    """test_location_detail.

    Args:
        location (Location): location
    """
    assert (
        reverse("api:location-detail", kwargs={"pk": location.id})
        == f"/api/locations/{location.id}"
    )
    assert resolve(f"/api/locations/{location.id}").view_name == "api:location-detail"


def test_location_list():
    """test_location_list."""
    assert reverse("api:location-list") == "/api/locations"
    assert resolve("/api/locations").view_name == "api:location-list"
