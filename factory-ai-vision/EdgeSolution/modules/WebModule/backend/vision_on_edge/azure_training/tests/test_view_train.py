"""
Project's custom action 'train' test
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
from vision_on_edge.cameras.models import Camera
from vision_on_edge.locations.models import Location

from ..models import Project

PROJECT_PREFIX = "UnitTest"

logger = logging.getLogger(__name__)


class ViewTrainTestCase(APITransactionTestCase):
    """
    Project's custom action 'train' test
    """

    def setUp(self):
        """
        Setup and create projects.
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
            customvision_project_id='super_valid_project_id',
            customvision_project_name=f'{PROJECT_PREFIX}-test_create_1',
            is_demo=False)
        invalid_project_obj.parts.add(part_obj)

        valid_project_obj = Project.objects.create(
            setting=Setting.objects.filter(name='valid_setting').first(),
            camera=Camera.objects.filter(name='camera_1').first(),
            location=Location.objects.filter(name='location_1').first(),
            customvision_project_id='super_valid_project_id',
            customvision_project_name=f'{PROJECT_PREFIX}-test_create_2',
            is_demo=False)
        valid_project_obj.parts.add(part_obj)

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """
        self.assertEqual(len(Camera.objects.all()), 1)
        valid_setting = Setting.objects.filter(name='valid_setting').first()
        Project.objects.get(setting=valid_setting)

    def test_train_valid_project(self):
        """
        @Type
        Positive

        @Description
        Train a project with valid setting.
        In this case, we have no image...

        @Expected Results
        Project get trained

        @Expected HTTP Response
        400 {'status': 'failed', 'log': 'Not enough images for training'}
        """
        url = reverse('project-list')
        valid_setting = Setting.objects.filter(name='valid_setting').first()
        project_obj = Project.objects.filter(setting=valid_setting).first()
        response = self.client.get(f'{url}/{project_obj.id}/train')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content)['status'], 'failed')
        self.assertEqual(
            json.loads(response.content)['log'],
            'Not enough images for training')

    def test_train_invalid_project(self):
        """
        @Type
        Negative

        @Description
        Train a project with invalid setting.
        customvision project id set to ''

        @Expected Results
        Project not trained. customvision_project_id set to ''

        @Expected HTTP Response
        503 {'status': 'failed', 'log': 'training key + endpoint invalid'}
        """
        url = reverse('project-list')
        invalid_setting = Setting.objects.filter(
            name='invalid_setting').first()
        project_obj = Project.objects.filter(setting=invalid_setting).first()
        response = self.client.get(f'{url}/{project_obj.id}/train')

        self.assertEqual(response.status_code,
                         status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(json.loads(response.content)['status'], 'failed')

    @classmethod
    def tearDownClass(cls):
        trainer = CustomVisionTrainingClient(api_key=TRAINING_KEY,
                                             endpoint=ENDPOINT)
        projects = trainer.get_projects()
        for project in projects:
            if project.name.find(PROJECT_PREFIX) == 0:
                trainer.delete_project(project_id=project.id)
