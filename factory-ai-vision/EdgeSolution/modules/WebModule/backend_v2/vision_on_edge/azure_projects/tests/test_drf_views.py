# -*- coding: utf-8 -*-
"""App drf view tests.
"""

import json

import pytest

from rest_framework import status
from rest_framework.test import APIRequestFactory
from vision_on_edge.azure_projects.api.serializers import ProjectSerializer
from vision_on_edge.azure_projects.api.views import ProjectViewSet
from vision_on_edge.azure_projects.models import Project

pytestmark = pytest.mark.django_db


def test_get(project: Project):
    """test_get_queryset.

    Args:
        notification (Notification): notification
        rf (APIRequestFactory): rf
    """
    factory = APIRequestFactory()
    project_list_view = ProjectViewSet.as_view({'get': 'list'})
    request = factory.get("/fake-url/")

    response = project_list_view(request)
    assert response.status_code == status.HTTP_200_OK
    assert ProjectSerializer(project).data in json.loads(
        response.render().content.decode('utf-8'))


def test_get_filter():
    """test_get_queryset.

    Args:
        notification (Notification): notification
        rf (APIRequestFactory): rf
    """
    factory = APIRequestFactory()
    real_project = Project.objects.create(is_demo=False)
    demo_project = Project.objects.create(is_demo=True)

    project_list_view = ProjectViewSet.as_view({'get': 'list'})
    request = factory.get("/fake-url/", {'is_demo': 0})

    response = project_list_view(request)
    assert response.status_code == status.HTTP_200_OK
    assert ProjectSerializer(demo_project).data not in json.loads(
        response.render().content.decode('utf-8'))
    assert ProjectSerializer(real_project).data in json.loads(
        response.render().content.decode('utf-8'))
