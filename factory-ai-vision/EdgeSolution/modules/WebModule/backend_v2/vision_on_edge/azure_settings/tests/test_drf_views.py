"""App drf view tests.
"""

import json
from unittest import mock

import pytest
from rest_framework import status
from rest_framework.test import APIRequestFactory

from ..api.serializers import SettingSerializer
from ..api.views import SettingViewSet
from ..models import Setting
from .factories import SettingFactory

pytestmark = pytest.mark.django_db


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.get_domain_id",
    mock.MagicMock(return_value="Fake_id"),
)
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.validate",
    mock.MagicMock(return_value=True),
)
def test_get():
    """test_get_queryset."""
    setting = SettingFactory()
    factory = APIRequestFactory()
    project_list_view = SettingViewSet.as_view({"get": "list"})
    request = factory.get("/fake-url/")

    response = project_list_view(request).render()

    assert response.status_code == status.HTTP_200_OK
    assert SettingSerializer(setting).data in json.loads(
        response.content.decode("utf-8")
    )
