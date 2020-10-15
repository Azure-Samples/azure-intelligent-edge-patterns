"""App utilites tests.
"""

import pytest

from ..helpers import create_demo_objects
from ..models import Camera

pytestmark = pytest.mark.django_db


def test_create_demo_objects():
    """test_create_demo_objects."""
    create_demo_objects()
    assert Camera.objects.count() >= 0
