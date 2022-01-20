"""App API views tests.
"""

import logging
from unittest import mock

import pytest
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.test import APIRequestFactory

from ...general.api.serializers import MSStyleErrorResponseSerializer
from ..api.serializers import ListProjectSerializer
from ..api.views import SettingViewSet
from ..exceptions import SettingCustomVisionAccessFailed
from .factories import SettingFactory

logger = logging.getLogger(__name__)

pytestmark = pytest.mark.django_db


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.get_projects",
    mock.MagicMock(return_value={}),
)
def test_valid_setting_list_projects():
    """test_valid_setting_list_projects.

    Type:
        Positive

    Description:
        With given valid azure settings, list_projects
        show list all project under this namespace.
    """
    setting = SettingFactory()
    factory = APIRequestFactory()
    request = factory.get("5566")
    response = SettingViewSet().list_projects(request, pk=setting.id)
    assert response.status_code == status.HTTP_200_OK
    assert ListProjectSerializer(data=response.data).is_valid()


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.get_projects",
    mock.MagicMock(side_effect=SettingCustomVisionAccessFailed),
)
def test_empty_setting_list_project():
    """test_empty_setting_list_project.

    Type:
        Negative

    Description:
        With given valid azure settings, list_project
        show list all project under this namespace.
    """
    setting = SettingFactory()
    setting.training_key = ""
    setting.save()
    factory = APIRequestFactory()
    request = factory.get("5566")
    try:
        response = SettingViewSet().list_projects(request, pk=setting.id)
        assert False
    except APIException as error:
        exception_handler = SettingViewSet().get_exception_handler()
        response = exception_handler(exc=error, context=None)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert MSStyleErrorResponseSerializer(data=response.data).is_valid()
