import logging
import json

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITransactionTestCase
from cameras.models import Project, Setting, Camera, Location, Part
from config import ENDPOINT, TRAINING_KEY
from unittest.mock import patch
from azure.cognitiveservices.vision.customvision.training import CustomVisionTrainingClient
project_prefix = "UnitTest"

logger = logging.getLogger(__name__)


class ViewTrainTestCase(APITransactionTestCase):
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
        camera_obj = Camera.objects.create(name="camera_1",
                                           rtsp="valid_rtsp",
                                           area="55,66",
                                           is_demo=False)

        location_obj = Location.objects.create(name="location_1",
                                               description=f"description_1",
                                               is_demo=False)
        part_obj = Part.objects.create(name="part_1",
                                       description=f"description_1",
                                       is_demo=False)
        invalid_project_obj = Project.objects.create(
            setting=Setting.objects.filter(name='invalid_setting').first(),
            camera=Camera.objects.filter(name='camera_1').first(),
            location=Location.objects.filter(name='location_1').first(),
            customvision_project_id='super_valid_project_id',
            customvision_project_name=f'{project_prefix}-test_create_1',
            is_demo=False
        )
        invalid_project_obj.parts.add(part_obj)

        valid_project_obj = Project.objects.create(
            setting=Setting.objects.filter(name='valid_setting').first(),
            camera=Camera.objects.filter(name='camera_1').first(),
            location=Location.objects.filter(name='location_1').first(),
            customvision_project_id='super_valid_project_id',
            customvision_project_name=f'{project_prefix}-test_create_2',
            is_demo=False
        )
        valid_project_obj.parts.add(part_obj)

    def test_setup_is_valid(self):
        """Make sure setup is valid"""
        self.assertEqual(len(Camera.objects.all()), 1)
        valid_setting = Setting.objects.filter(name='valid_setting').first()
        project_obj = Project.objects.filter(setting=valid_setting).first()

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

        self.assertEqual(response.status_code,
                         status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content)['status'],
                         'failed')
        self.assertEqual(json.loads(response.content)['log'],
                         'Not enough images for training')

    def test_train_invalid_project(self):
        """
        @Type
        Negative

        @Description
        Train a project with invalid setting.
        customvision project id set to ''

        @Expected Results
        Project not trained. customvision project id = '' 

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
        self.assertEqual(json.loads(response.content)['status'],
                         'failed')

    @classmethod
    def tearDownClass(self):
        trainer = CustomVisionTrainingClient(
            api_key=TRAINING_KEY, endpoint=ENDPOINT)
        projects = trainer.get_projects()
        for project in projects:
            if project.name.find(project_prefix) == 0:
                trainer.delete_project(project_id=project.id)
