"""App drf view tests.
"""

import json

import pytest
from rest_framework import status
from rest_framework.test import APIRequestFactory

from ..api.serializers import PDScenarioSerializer
from ..api.views import PartDetectionViewSet
from ..models import Project

pytestmark = pytest.mark.django_db


def test_get(project: Project):
    """test_get_queryset.

    Args:
        notification (Notification): notification
    """
    factory = APIRequestFactory()
    project_list_view = ProjectViewSet.as_view({"get": "list"})
    request = factory.get("/fake-url/")

    response = project_list_view(request).render()
    response_body = response.content.decode("utf-8")

    assert ProjectSerializer(project).data in json.loads(response_body)


def test_get_filter():
    """test_get_queryset.
    """
    factory = APIRequestFactory()
    real_project = Project.objects.create(is_demo=False)
    demo_project = Project.objects.create(is_demo=True)

    project_list_view = ProjectViewSet.as_view({"get": "list"})
    request = factory.get("/fake-url/", {"is_demo": False})

    response = project_list_view(request).render()
    response_body = response.content.decode("utf-8")

    assert ProjectSerializer(demo_project).data in json.loads(response_body)
    assert ProjectSerializer(real_project).data not in json.loads(response_body)
