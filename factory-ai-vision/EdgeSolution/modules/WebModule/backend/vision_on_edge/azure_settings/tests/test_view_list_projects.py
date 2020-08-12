# -*- coding: utf-8 -*-
"""Azure Setting List Project test case.
"""

import json
import logging

from django.urls import reverse
from rest_framework import status

from vision_on_edge.general import error_messages
from vision_on_edge.general.tests.azure_testcase import CustomVisionTestCase

from ..models import Setting

logger = logging.getLogger(__name__)


class ActionListProjectTestCase(CustomVisionTestCase):
    """ActionListProjectTestCase.

    Testing azure-setting's action: list_projects
    """

    def setUp(self):
        """setUp.

        Create setting, camera, location and parts.
        """
        Setting.objects.create(name="valid_setting",
                               endpoint=self.endpoint,
                               training_key=self.training_key,
                               is_trainer_valid=False)
        Setting.objects.create(name="invalid_setting",
                               endpoint=self.endpoint,
                               training_key='5566',
                               is_trainer_valid=False)
        Setting.objects.create(name="empty_endpoint_setting",
                               endpoint='',
                               training_key='5566',
                               is_trainer_valid=True)
        Setting.objects.create(name="empty_training_key_setting",
                               endpoint=self.endpoint,
                               training_key='',
                               is_trainer_valid=True)
        Setting.objects.create(name="empty_setting",
                               endpoint='',
                               training_key='',
                               is_trainer_valid=True)

    def test_setup_is_valid(self):
        """test_setup_is_valid.

        Make sure setup is valid
        """
        self.assertEqual(len(Setting.objects.all()), 5)

    def test_valid_setting_list_project(self):
        """test_valid_setting_list_project.

        Type:
            Positive

        Description:
            With given valid azure settings, list_project
            show list all project under this namespace.

        Expected Results:
            200 { 'project_id':'project_name' }
        """
        valid_setting = Setting.objects.filter(name='valid_setting').first()
        url = reverse('api:setting-list-projects',
                      kwargs={'pk': valid_setting.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(json.loads(response.content)) > 0)

    def test_empty_setting_list_project_1(self):
        """test_empty_setting_list_project_1.

        Type:
            Negative

        Description:
            List projects with invalid Azure Setting.

        Expected Results:
            400 { 'status':'failed', 'log':'xxx' }
        """
        # Setting with empty key + endpoint
        empty_setting = Setting.objects.filter(name='empty_setting').first()
        url = reverse('api:setting-list-projects',
                      kwargs={'pk': empty_setting.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content)['status'], 'failed')
        self.assertEqual(
            json.loads(response.content)['log'],
            error_messages.CUSTOM_VISION_MISSING_FIELD)

    def test_empty_setting_list_project_2(self):
        """test_empty_setting_list_project_2.

        Type:
            Negative

        Description:
            List projects with invalid Azure Setting.

        Expected Results:
            400 { 'status':'failed', 'log':'xxx' }
        """

        # Setting with empty endpoint
        empty_endpoint_setting = Setting.objects.filter(
            name='empty_endpoint_setting').first()
        url = reverse('api:setting-list-projects',
                      kwargs={'pk': empty_endpoint_setting.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content)['status'], 'failed')
        self.assertEqual(
            json.loads(response.content)['log'],
            error_messages.CUSTOM_VISION_MISSING_FIELD)

    def test_empty_setting_list_project_3(self):
        """test_empty_setting_list_project_3.

        Type:
            Negative

        Description:
            List projects with invalid Azure Setting.

        Expected Results:
            400 { 'status':'failed', 'log':'xxx' }
        """

        # Setting with empty_key
        empty_key_setting = Setting.objects.filter(
            name='empty_training_key_setting').first()
        url = reverse('api:setting-list-projects',
                      kwargs={'pk': empty_key_setting.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content)['status'], 'failed')
        self.assertEqual(
            json.loads(response.content)['log'],
            error_messages.CUSTOM_VISION_MISSING_FIELD)

    def test_invalid_setting_list_project(self):
        """test_invalid_setting_list_project.

        Type:
            Negative

        Description:
            List project with invalid setting.

        Expected Results:
            503 { 'status':'failed', 'log':'xxx' }
        """
        invalid_setting = Setting.objects.filter(
            name='invalid_setting').first()
        url = reverse('api:setting-list-projects',
                      kwargs={'pk': invalid_setting.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code,
                         status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(json.loads(response.content)['status'], 'failed')
        self.assertEqual(
            json.loads(response.content)['log'],
            error_messages.CUSTOM_VISION_ACCESS_ERROR)
