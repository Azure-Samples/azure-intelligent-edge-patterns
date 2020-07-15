"""
Testing Model Setting's custom action 'reset project'
"""
import json
import logging

from azure.cognitiveservices.vision.customvision.training import \
    CustomVisionTrainingClient
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITransactionTestCase

from configs.customvision_config import ENDPOINT, TRAINING_KEY
from vision_on_edge.azure_parts.models import Part
from vision_on_edge.azure_settings.models import Setting
from vision_on_edge.azure_training.models import Project
from vision_on_edge.cameras.models import Camera
from vision_on_edge.locations.models import Location

PROJECT_PREFIX = "UnitTest"

logger = logging.getLogger(__name__)


class ResetProjectTestCase(APITransactionTestCase):
    """
    Reset Project test cases
    """

    def setUp(self):
        """
        Setup, created objects.
        """
        Setting.objects.create(name="valid_setting",
                               endpoint=ENDPOINT,
                               training_key=TRAINING_KEY,
                               is_trainer_valid=False)
        Setting.objects.create(name="invalid_setting",
                               endpoint=ENDPOINT,
                               training_key='',
                               is_trainer_valid=False)

        Camera.objects.create(name="camera_1",
                              rtsp="0",
                              area="55,66",
                              is_demo=False)

        Location.objects.create(name="location_1",
                                description="description_1",
                                is_demo=False)
        part_obj = Part.objects.create(name="part_1",
                                       description="description_1",
                                       is_demo=False)

        invalid_project_obj = Project.objects.create(
            setting=Setting.objects.filter(name='invalid_setting').first(),
            camera=Camera.objects.filter(name='camera_1').first(),
            location=Location.objects.filter(name='location_1').first(),
            customvision_project_id='foo',
            customvision_project_name=f'{PROJECT_PREFIX}-test_create_1',
            is_demo=False)
        invalid_project_obj.parts.add(part_obj)

        valid_project_obj = Project.objects.create(
            setting=Setting.objects.filter(name='valid_setting').first(),
            camera=Camera.objects.filter(name='camera_1').first(),
            location=Location.objects.filter(name='location_1').first(),
            customvision_project_id='bar',
            customvision_project_name=f'{PROJECT_PREFIX}-test_create_2',
            is_demo=False)
        valid_project_obj.parts.add(part_obj)

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """
        self.assertEqual(len(Project.objects.all()), 2)

    def test_valid_setting_reset_project_1(self):
        """
        @Type
        Positive

        @Description
        Reset a project with valid setting

        @Expected Results:
        200 {'status': 'ok'}
        """
        url = reverse('project-list')
        valid_setting = Setting.objects.filter(name='valid_setting').first()
        valid_project = Project.objects.filter(setting=valid_setting).first()
        response = self.client.get(
            path=f'{url}/{valid_project.id}/reset_project',
            data={'project_name': f'{PROJECT_PREFIX}-test-reset-1'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content)['status'], 'ok')

    def test_valid_setting_reset_project_2(self):
        """
        @Type
        Positive

        @Description
        Make sure default needRetraining is True after reset.

        @Expected Results
        200 {... : ...
             'needRetraining': true
             ... : ...}
        """
        url = reverse('project-list')
        valid_setting = Setting.objects.filter(name='valid_setting').first()
        valid_project = Project.objects.filter(setting=valid_setting).first()
        response = self.client.get(
            path=f'{url}/{valid_project.id}/reset_project',
            data={'project_name': f'{PROJECT_PREFIX}-test-reset-1'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content)['status'], 'ok')

        response = self.client.get(path=f'{url}/{valid_project.id}')
        self.assertTrue(json.loads(response.content)['needRetraining'])

    def test_invalid_setting_reset_project(self):
        """
        @Type
        Negative

        @Description
        Reset a project with invalid setting

        @Expected Results:
        400 {'status': 'failed', 'log': 'some reason'}
        """
        url = reverse('project-list')
        invalid_setting = Setting.objects.filter(
            name='invalid_setting').first()
        invalid_project = Project.objects.filter(
            setting=invalid_setting).first()
        response = self.client.get(
            path=f'{url}/{invalid_project.id}/reset_project',
            data={'project_name': f'{PROJECT_PREFIX}-test-reset-2'})

        self.assertNotEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('failed', json.loads(response.content)['status'])
        self.assertTrue(len(json.loads(response.content)['log']) > 0)

    def test_valid_setting_reset_project_without_project_name(self):
        """
        @Type
        Negative

        @Description
        Reset a project with valid setting. However, project_name not provided

        @Expected Results
        400 {'status': 'failed', 'log': 'some reason'}
        """
        url = reverse('project-list')
        invalid_setting = Setting.objects.filter(
            name='invalid_setting').first()
        invalid_project = Project.objects.filter(
            setting=invalid_setting).first()
        response = self.client.get(
            path=f'{url}/{invalid_project.id}/reset_project')

        self.assertNotEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('failed', json.loads(response.content)['status'])
        self.assertTrue(
            json.loads(response.content)['log'].find('project_name') >= 0)

    @classmethod
    def tearDownClass(cls):
        trainer = CustomVisionTrainingClient(api_key=TRAINING_KEY,
                                             endpoint=ENDPOINT)
        projects = trainer.get_projects()
        for project in projects:
            if project.name.find(PROJECT_PREFIX) == 0:
                trainer.delete_project(project_id=project.id)
