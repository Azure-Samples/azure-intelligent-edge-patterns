# -*- coding: utf-8 -*-
"""App drf view tests.
"""

import json

import pytest
from rest_framework import status
from rest_framework.test import APIRequestFactory

from ..api.serializers import SettingSerializer
from ..api.views import SettingViewSet
from ..models import Setting

pytestmark = pytest.mark.django_db


def test_get(setting: Setting):
    """test_get_queryset.
    """
    factory = APIRequestFactory()
    project_list_view = SettingViewSet.as_view({'get': 'list'})
    request = factory.get("/fake-url/")

    response = project_list_view(request).render()

    assert response.status_code == status.HTTP_200_OK
    assert SettingSerializer(setting).data in json.loads(
        response.content.decode('utf-8'))
