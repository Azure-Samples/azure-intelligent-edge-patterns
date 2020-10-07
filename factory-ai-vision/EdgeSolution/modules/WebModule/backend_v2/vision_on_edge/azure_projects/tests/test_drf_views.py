"""App drf view tests.
"""

import json
from unittest import mock

import pytest
from rest_framework import status
from rest_framework.test import APIRequestFactory

from ..api.serializers import ProjectSerializer
from ..api.views import ProjectViewSet
from .factories import ProjectFactory

pytestmark = pytest.mark.django_db


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_projects.models.Project.validate",
    mock.MagicMock(return_value=True),
)
def test_get():
    """test_get_queryset.

    Args:
        notification (Notification): notification
    """
    project = ProjectFactory()
    project.save()
    factory = APIRequestFactory()
    project_list_view = ProjectViewSet.as_view({"get": "list"})
    request = factory.get("/fake-url/")

    response = project_list_view(request)
    assert response.status_code == status.HTTP_200_OK
    assert ProjectSerializer(project).data in json.loads(
        response.render().content.decode("utf-8")
    )


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_projects.models.Project.validate",
    mock.MagicMock(return_value=True),
)
def test_get_filter():
    """test_get_filter."""
    factory = APIRequestFactory()

    real_project = ProjectFactory()
    real_project.is_demo = False
    real_project.save()

    demo_project = ProjectFactory()
    demo_project.delete()
    demo_project.is_demo = True
    demo_project.save()

    project_list_view = ProjectViewSet.as_view({"get": "list"})
    request = factory.get("/fake-url/", {"is_demo": 0})

    response = project_list_view(request).render()
    response_body = response.content.decode("utf-8")

    assert response.status_code == status.HTTP_200_OK
    assert ProjectSerializer(demo_project).data not in json.loads(response_body)
    assert ProjectSerializer(real_project).data in json.loads(response_body)
