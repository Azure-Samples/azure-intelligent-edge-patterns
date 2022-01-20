"""App drf url tests.
"""

import pytest
from django.urls import resolve, reverse

pytestmark = pytest.mark.django_db


def test_camera_task_detail(camera_task):
    """test_camera_task_detail."""
    assert (
        reverse("api:cameratask-detail", kwargs={"pk": camera_task.id})
        == f"/api/camera_tasks/{camera_task.id}"
    )
    assert (
        resolve(f"/api/camera_tasks/{camera_task.id}").view_name
        == "api:cameratask-detail"
    )


def test_camera_task_list():
    """test_camera_task_list."""
    assert reverse("api:cameratask-list") == "/api/camera_tasks"
    assert resolve("/api/camera_tasks").view_name == "api:cameratask-list"
