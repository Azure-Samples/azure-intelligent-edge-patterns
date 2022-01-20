"""App model tests
"""
import pytest

from ..models import Location

pytestmark = pytest.mark.django_db


def test_create_without_description(location):
    """test_create_without_description."""
    location_obj = Location.objects.create(name=location.name, is_demo=False)
    assert isinstance(location_obj, Location)


def test_model_str_method(location):
    """test_create_without_description."""
    assert str(location) == location.name
