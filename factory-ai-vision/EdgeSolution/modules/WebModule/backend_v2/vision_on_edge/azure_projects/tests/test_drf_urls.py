"""App drf url tests.
"""

from unittest import mock

import pytest
from django.urls import resolve, reverse

from .factories import ProjectFactory

pytestmark = pytest.mark.django_db


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_projects.models.Project.validate",
    mock.MagicMock(return_value=True),
)
def test_project_detail():
    """test_project_detail.

    Args:
        project (Project): project
    """
    project = ProjectFactory()
    assert (
        reverse("api:project-detail", kwargs={"pk": project.id})
        == f"/api/projects/{project.id}"
    )
    assert resolve(f"/api/projects/{project.id}").view_name == "api:project-detail"


@pytest.mark.fast
def test_project_list():
    """test_project_list."""
    assert reverse("api:project-list") == "/api/projects"
    assert resolve("/api/projects").view_name == "api:project-list"
