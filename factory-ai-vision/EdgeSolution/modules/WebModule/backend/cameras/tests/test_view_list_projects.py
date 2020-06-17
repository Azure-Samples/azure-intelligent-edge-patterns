import logging
import json
from pprint import pformat

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITransactionTestCase
from cameras.models import Setting
from config import ENDPOINT, TRAINING_KEY
from azure.cognitiveservices.vision.customvision.training import CustomVisionTrainingClient
project_prefix = "UnitTest"

logger = logging.getLogger(__name__)


class ViewListProjectTestCase(APITransactionTestCase):
    def setUp(self):
        """Create setting, camera, location anr parts.
        """
        valid_setting_obj = Setting.objects.create(name="valid_setting",
                                                   endpoint=ENDPOINT,
                                                   training_key=TRAINING_KEY,
                                                   is_trainer_valid=False)
        invalid_setting_obj = Setting.objects.create(name="invalid_setting",
                                                     endpoint=ENDPOINT,
                                                     training_key='',
                                                     is_trainer_valid=False)

    def test_setup_is_valid(self):
        self.assertEqual(len(Setting.objects.all()), 2)

    def test_valid_setting_list_project(self):
        """invalid setting should show projects with json
        """
        url = reverse('setting-list')
        valid_setting = Setting.objects.filter(name='valid_setting').first()
        response = self.client.get(f'{url}/{valid_setting.id}/list_projects')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        try:
            json.loads(response.content)
        except:
            self.fail("Response Content is not json loadable")

    def test_invalid_setting_list_project(self):
        """invalid setting should return status = failed.
        """
        url = reverse('setting-list')
        invalid_setting = Setting.objects.filter(
            name='invalid_setting').first()
        response = self.client.get(f'{url}/{invalid_setting.id}/list_projects')
        self.assertNotEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual('failed', json.loads(response.content)['status'])

    @classmethod
    def tearDownClass(self):
        trainer = CustomVisionTrainingClient(
            api_key=TRAINING_KEY, endpoint=ENDPOINT)
        projects = trainer.get_projects()
        for project in projects:
            if project.name.find(project_prefix) == 0:
                trainer.delete_project(project_id=project.id)
