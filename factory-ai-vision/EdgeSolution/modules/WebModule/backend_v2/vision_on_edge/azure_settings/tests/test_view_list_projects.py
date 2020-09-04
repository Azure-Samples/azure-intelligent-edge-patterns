# -*- coding: utf-8 -*-
"""App API views tests.
"""

import logging
from unittest import mock

from rest_framework import status
from rest_framework.test import APIRequestFactory
from rest_framework.exceptions import APIException
import pytest

from ..models import Setting
from ..api.views import SettingViewSet
from ..api.serializers import ListProjectSerializer

logger = logging.getLogger(__name__)

pytestmark = pytest.mark.django_db


@mock.patch("vision_on_edge.azure_settings.api.views.Setting.get_projects",
            mock.MagicMock(return_value={}))
def test_valid_setting_list_project(setting: Setting):
    """test_valid_setting_list_project.

    Type:
        Positive

    Description:
        With given valid azure settings, list_project
        show list all project under this namespace.
    """
    factory = APIRequestFactory()
    request = factory.get("5566")
    response = SettingViewSet().list_projects(request, pk=setting.id)
    assert response.status_code == status.HTTP_200_OK
    assert ListProjectSerializer(data=response.data).is_valid()


def test_empty_setting_list_project_1(setting: Setting):
    """test_empty_setting_list_project_1.

    Type:
        Negative

    Description:
        With given valid azure settings, list_project
        show list all project under this namespace.
    """
    setting.training_key = ""
    setting.save()
    factory = APIRequestFactory()
    # request = factory.get("5566")
    # url = reverse("api:setting-list-projects", args=(setting.id,))
    # request = factory.get(url)
    # view = SettingViewSet.as_view({'get': 'list'})

    # response = view(request)

    request = factory.get("5566")
    try:
        response = SettingViewSet().list_projects(request, pk=setting.id)
        assert False
    except APIException as exc:
        exception_handler = SettingViewSet().get_exception_handler()
        response = exception_handler(exc=exc, context=None)
        assert response.status_code == status.HTTP_200_OK
        assert ListProjectSerializer(data=response.data).is_valid()
    # assert False
    # except Exception as exc:
    # print(exc)
    # response = ms_style_exception_handler(exc=exc, context=None)
    # import logging
    # logging.critical(response)
    # assert response.status_code == status.HTTP_200_OK
    # assert ListProjectSerializer(data=response.data).is_valid()


# def test_empty_setting_list_project_2(self):
# """test_empty_setting_list_project_2.

# Type:
# Negative

# Description:
# List projects with invalid Azure Setting.

# Expected Results:
# 400 { 'status':'failed', 'log':'xxx' }
# """

# # Setting with empty endpoint
# empty_endpoint_setting = Setting.objects.filter(
# name='empty_endpoint_setting').first()
# url = reverse('api:setting-list-projects',
# kwargs={'pk': empty_endpoint_setting.id})
# response = self.client.get(url)

# assert response.status_code == status.HTTP_400_BAD_REQUEST
# assert json.loads(response.content)['status'] == 'failed'

# def test_empty_setting_list_project_3(self):
# """test_empty_setting_list_project_3.

# Type:
# Negative

# Description:
# List projects with invalid Azure Setting.

# Expected Results:
# 400 { 'status':'failed', 'log':'xxx' }
# """

# # Setting with empty_key
# empty_key_setting = Setting.objects.filter(
# name='empty_training_key_setting').first()
# url = reverse('api:setting-list-projects',
# kwargs={'pk': empty_key_setting.id})
# response = self.client.get(url)

# assert response.status_code == status.HTTP_400_BAD_REQUEST
# assert json.loads(response.content)['status'] == 'failed'
