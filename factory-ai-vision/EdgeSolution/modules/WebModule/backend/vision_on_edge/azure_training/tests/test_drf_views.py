# -*- coding: utf-8 -*-
"""Test drf views
"""

import json

import pytest
from rest_framework import status
from rest_framework.test import APIRequestFactory

from vision_on_edge.azure_training.api.serializers import ProjectSerializer
from vision_on_edge.azure_training.api.views import ProjectViewSet
from vision_on_edge.azure_settings.models import Setting
from vision_on_edge.azure_training.models import Project

pytestmark = pytest.mark.django_db


def test_get(project: Project, rf: APIRequestFactory):
    """test_get_queryset.

    Args:
        notification (Notification): notification
        rf (APIRequestFactory): rf
    """
    project_list_view = ProjectViewSet.as_view({'get': 'list'})
    request = rf.get("/fake-url/")

    response = project_list_view(request).render().content.decode('utf-8')

    assert ProjectSerializer(project).data in json.loads(response)


def test_get_filter():
    """test_get_queryset.

    Args:
        notification (Notification): notification
        rf (APIRequestFactory): rf
    """
    rf = APIRequestFactory()
    real_project = Project.objects.create(is_demo=False)
    demo_project = Project.objects.create(is_demo=True)

    project_list_view = ProjectViewSet.as_view({'get': 'list'})
    request = rf.get("/fake-url/", {'is_demo': False})

    response = project_list_view(request).render().content.decode('utf-8')

    assert ProjectSerializer(demo_project).data in json.loads(response)
    assert ProjectSerializer(real_project).data not in json.loads(response)
