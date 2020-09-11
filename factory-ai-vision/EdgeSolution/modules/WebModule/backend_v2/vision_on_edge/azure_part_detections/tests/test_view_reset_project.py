# -*- coding: utf-8 -*-
"""Azure Setting's custom action 'reset_project' test
"""

import json

from django.urls import reverse
from rest_framework import status

from vision_on_edge.azure_parts.models import Part
from vision_on_edge.azure_projects.models import Project
from vision_on_edge.azure_settings.models import Setting
from vision_on_edge.cameras.models import Camera
from vision_on_edge.general.tests.azure_testcase import CustomVisionTestCase
from vision_on_edge.locations.models import Location


class ResetProjectTestCase(CustomVisionTestCase):
    """ResetProjectTestCase.

    Reset Project test cases.
    """

    def setUp(self):
        """setUp.
        """
        Setting.objects.create(name="valid_setting",
                               endpoint=self.endpoint,
                               training_key=self.training_key,
                               is_trainer_valid=False)
        Setting.objects.create(name="invalid_setting",
                               endpoint=self.endpoint,
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
            customvision_project_name=f'{self.project_prefix}-test_create_1',
            is_demo=False)
        invalid_project_obj.parts.add(part_obj)

        valid_project_obj = Project.objects.create(
            setting=Setting.objects.filter(name='valid_setting').first(),
            camera=Camera.objects.filter(name='camera_1').first(),
            location=Location.objects.filter(name='location_1').first(),
            customvision_project_id='bar',
            customvision_project_name=f'{self.project_prefix}-test_create_2',
            is_demo=False)
        valid_project_obj.parts.add(part_obj)

    def test_setup_is_valid(self):
        """test_setup_is_valid.
        """
        self.assertEqual(len(Project.objects.all()), 2)

    def test_valid_setting_reset_project_1(self):
        """test_valid_setting_reset_project_1.

        Type:
            Positive

        Description:
            Reset a project with valid setting

        Expected Results:
            200 { 'status': 'ok' }
        """

        valid_setting = Setting.objects.filter(name='valid_setting').first()
        valid_project = Project.objects.filter(setting=valid_setting).first()
        url = reverse('api:project-detail', kwargs={'pk': valid_project.id})
        response = self.client.get(
            path=(url + '/reset_project'),
            data={'project_name': f'{self.project_prefix}-test-reset-1'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content)['status'], 'ok')

    def test_valid_setting_reset_project_2(self):
        """test_valid_setting_reset_project_2

        Type:
            Positive

        Description:
            Make sure default needRetraining is True after reset.

        Expected Results:
            200 {... : ...
                 'needRetraining': true
                 ... : ...}
        """
        valid_setting = Setting.objects.filter(name='valid_setting').first()
        valid_project = Project.objects.filter(setting=valid_setting).first()
        url = reverse('api:project-detail', kwargs={'pk': valid_project.id})
        response = self.client.get(
            path=(url + '/reset_project'),
            data={'project_name': f'{self.project_prefix}-test-reset-1'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content)['status'], 'ok')

        response = self.client.get(path=url)
        self.assertTrue(json.loads(response.content)['needRetraining'])

    def test_invalid_setting_reset_project(self):
        """test_invalid_setting_reset_project.

        Type:
            Negative

        Description:
            Reset a project with invalid setting

        Expected Results:
            400 { 'status': 'failed', 'log': 'xxx' }
        """
        invalid_setting = Setting.objects.filter(
            name='invalid_setting').first()
        invalid_project = Project.objects.filter(
            setting=invalid_setting).first()
        url = reverse('api:project-detail', kwargs={'pk': invalid_project.id})
        response = self.client.get(
            path=(url + '/reset_project'),
            data={'project_name': f'{self.project_prefix}-test-reset-2'})

        self.assertNotEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('failed', json.loads(response.content)['status'])
        self.assertTrue(len(json.loads(response.content)['log']) > 0)

    def test_valid_setting_reset_project_without_project_name(self):
        """test_valid_setting_reset_project_without_project_name.

        Type:
            Negative

        Description:
            Reset a project with valid setting. However,
            project_name not provided.

        Expected Results:
            400 { 'status': 'failed', 'log': 'xxx' }
        """

        invalid_setting = Setting.objects.filter(
            name='invalid_setting').first()
        invalid_project = Project.objects.filter(
            setting=invalid_setting).first()
        url = reverse('api:project-detail', kwargs={'pk': invalid_project.id})
        response = self.client.get(path=(url + '/reset_project'))

        self.assertNotEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual('failed', json.loads(response.content)['status'])
        self.assertTrue(
            json.loads(response.content)['log'].find('project_name') >= 0)
