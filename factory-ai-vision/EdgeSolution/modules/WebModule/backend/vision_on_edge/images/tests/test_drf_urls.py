import pytest
from django.urls import resolve, reverse

from vision_on_edge.locations.models import Location

pytestmark = pytest.mark.django_db


def test_location_detail(location: Location):
    location_id = location.id

    assert (reverse("api:location-detail",
                    kwargs={"pk": location.id
                           }) == f"/api/locations/{location.id}/")
    assert resolve(
        f"/api/locations/{location.id}/").view_name == "api:location-detail"
