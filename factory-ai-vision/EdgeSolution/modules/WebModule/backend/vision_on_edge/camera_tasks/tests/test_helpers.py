"""App helpers tests
"""

import pytest

from ...cameras.models import Camera
from ..helpers import create_tasks_at_startup
from ..models import CameraTask

pytestmark = pytest.mark.django_db


def test_create_tasks_at_startup(camera):
    """test_create_tasks_at_startup."""
    assert not CameraTask.objects.all().exists()
    create_tasks_at_startup()
    assert Camera.objects.all().exists()
