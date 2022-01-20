"""App signal tests
"""

import pytest

from ..models import CameraTask

pytestmark = pytest.mark.django_db


def task_created_upon_camera_create(camera):
    """task_created_upon_camera_create

    Args:
        camera (Camera): a Camera instance
    """
    assert CameraTask.objects.exists()
