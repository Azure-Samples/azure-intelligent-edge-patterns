"""DRF url tests
"""

import pytest
from django.urls import resolve, reverse

from vision_on_edge.azure_training.models import Project

pytestmark = pytest.mark.django_db


def test_project_detail(project: Project):
    """test_project_detail.

    Args:
        project (Project): project
    """
    assert (reverse("api:project-detail",
                    kwargs={"pk": project.id
                           }) == f"/api/projects/{project.id}")
    assert resolve(
        f"/api/projects/{project.id}").view_name == "api:project-detail"


def test_project_list():
    """test_project_list.
    """
    assert reverse("api:project-list") == "/api/projects"
    assert resolve("/api/projects").view_name == "api:project-list"
