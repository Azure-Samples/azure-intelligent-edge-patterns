"""App drf view tests.
"""

import json

import pytest
from rest_framework import status
from rest_framework.test import APIRequestFactory

from ..api.serializers import SettingSerializer
from ..api.views import SettingViewSet
from .factories import SettingFactory

pytestmark = pytest.mark.django_db


@pytest.mark.fast
def test_get():
    """test_get_queryset."""
    setting = SettingFactory()
    factory = APIRequestFactory()
    project_list_view = SettingViewSet.as_view({"get": "list"})
    request = factory.get("/fake-url/")

    response = project_list_view(request).render()
    response_body = response.content
    assert response.status_code == status.HTTP_200_OK
    assert SettingSerializer(setting).data in json.loads(response_body)
