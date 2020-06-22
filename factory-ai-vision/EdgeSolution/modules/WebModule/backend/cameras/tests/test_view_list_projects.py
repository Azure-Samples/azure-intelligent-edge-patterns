"""
Testing List Project API View (Under settings)
"""
import logging
import json

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITransactionTestCase

from azure.cognitiveservices.vision.customvision.training import (
    CustomVisionTrainingClient)

from cameras.models import Setting
from config import ENDPOINT, TRAINING_KEY

PROJECT_PREFIX = "UnitTest"

logger = logging.getLogger(__name__)


class ViewListProjectTestCase(APITransactionTestCase):
    """
    Testing setting-instance's custom action 'list_projects'
    """

    def setUp(self):
        """
        Create setting, camera, location and parts.
        """
        Setting.objects.create(name="valid_setting",
                               endpoint=ENDPOINT,
                               training_key=TRAINING_KEY,
                               is_trainer_valid=False)
        Setting.objects.create(name="invalid_setting",
                               endpoint=ENDPOINT,
                               training_key='',
                               is_trainer_valid=False)

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """
        self.assertEqual(len(Setting.objects.all()), 2)

    def test_valid_setting_list_project(self):
        """
        @Type
        Positive

        @Description
        List project with valid setting.

        @Expected Results
        200 {'project_id', 'project_name'}
        """
        url = reverse('setting-list')
        valid_setting = Setting.objects.filter(name='valid_setting').first()
        response = self.client.get(f'{url}/{valid_setting.id}/list_projects')

        self.assertEqual(response.status_code,
                         status.HTTP_200_OK)
        self.assertTrue(len(json.loads(response.content)) > 0)

    def test_invalid_setting_list_project(self):
        """
        @Type
        Negative

        @Description
        List project with invalid setting

        @Expected Results
        503 {'status':'failed',
             'log': 'xxx'}
        """
        url = reverse('setting-list')
        invalid_setting = Setting.objects.filter(
            name='invalid_setting').first()
        response = self.client.get(f'{url}/{invalid_setting.id}/list_projects')

        self.assertEqual(response.status_code,
                         status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(json.loads(response.content)['status'],
                         'failed')
        self.assertTrue(json.loads(response.content)['log'].find('valid') > 0)

    @classmethod
    def tearDownClass(cls):
        trainer = CustomVisionTrainingClient(
            api_key=TRAINING_KEY, endpoint=ENDPOINT)
        projects = trainer.get_projects()
        for project in projects:
            if project.name.find(PROJECT_PREFIX) == 0:
                trainer.delete_project(project_id=project.id)
