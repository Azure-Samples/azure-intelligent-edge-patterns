# -*- coding: utf-8 -*-
"""Project Model Test.
"""

import logging

from azure.cognitiveservices.vision.customvision.training import \
    CustomVisionTrainingClient

from vision_on_edge.azure_parts.models import Part
from vision_on_edge.azure_settings.models import Setting
from vision_on_edge.cameras.models import Camera
from vision_on_edge.general.tests.azure_testcase import CustomVisionTestCase
from vision_on_edge.locations.models import Location

from ..models import Project

logger = logging.getLogger(__name__)


class ProjectModelTestCases(CustomVisionTestCase):
    """ProjectModelTestCases
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
        for i in range(3):
            Camera.objects.create(name="demo_camera_{i}",
                                  rtsp="0",
                                  area="{i*2},{i*3}",
                                  is_demo=True)
            Camera.objects.create(name="camera_{i}",
                                  rtsp="0",
                                  area="{i*2},{i*3}",
                                  is_demo=False)

            Location.objects.create(name=f"location_{i}",
                                    description=f"description_{i}",
                                    is_demo=True)
            Location.objects.create(name=f"demo_location_{i}",
                                    description=f"description_{i}",
                                    is_demo=False)
            Part.objects.create(name=f"part_{i}",
                                description=f"description_{i}",
                                is_demo=True)
            Part.objects.create(name=f"part_{i}",
                                description=f"description_{i}",
                                is_demo=False)
        self.exist_num = 3

    def test_setup_is_valid(self):
        """
        Making sure setup is valid
        """
        self.assertEqual(Setting.objects.filter(training_key='').count(), 1)
        self.assertEqual(
            Setting.objects.filter(training_key=self.training_key).count(), 1)
        self.assertEqual(
            Camera.objects.filter(is_demo=True).count(), self.exist_num)
        self.assertEqual(
            Camera.objects.filter(is_demo=True).count(), self.exist_num)
        self.assertEqual(
            Location.objects.filter(is_demo=True).count(), self.exist_num)
        self.assertEqual(
            Location.objects.filter(is_demo=True).count(), self.exist_num)
        self.assertEqual(
            Part.objects.filter(is_demo=True).count(), self.exist_num)
        self.assertEqual(
            Part.objects.filter(is_demo=True).count(), self.exist_num)

    def test_create_1(self):
        """test_create_1.

        Type:
            Negative

        Description:
            Create projet given invalid/null azure_setting

        Expected Result:
            customvision_id = ''
        """
        project_obj = Project.objects.create(
            setting=Setting.objects.filter(name='invalid_setting').first(),
            camera=Camera.objects.filter(name='demo_camera_1').first(),
            location=Location.objects.filter(name='demo_location_1').first(),
            customvision_project_id='super_valid_project_id',
            customvision_project_name=f'{self.project_prefix}-test_create_1',
            is_demo=False)
        self.assertFalse(
            project_obj.customvision_project_id == 'super_valid_project_id')
        self.assertEqual(project_obj.customvision_project_id, '')

    def test_create_2(self):
        """test_create_2.

        Type:
            Positive

        Description:
            Project will not be created on Custom Vision
            until first train or create_project() get
            called.
        """
        trainer = CustomVisionTrainingClient(api_key=self.training_key,
                                             endpoint=self.endpoint)
        project_count = len(trainer.get_projects())
        project_obj = Project.objects.create(
            setting=Setting.objects.filter(name='valid_setting').first(),
            camera=Camera.objects.filter(name='demo_camera_1').first(),
            location=Location.objects.filter(name='demo_location_1').first(),
            customvision_project_name=f'{self.project_prefix}-test_create_2',
            is_demo=False)

        project_count_after = len(trainer.get_projects())
        self.assertEqual(project_obj.customvision_project_id, '')
        self.assertEqual(project_count, project_count_after)

    def test_create_3(self):
        """test_create_3

        Type:
            Negative

        Description:
            Valid setting with wrong customvision_project_id
            This state should not occur often...

        Expected results:
            customvision_project_id set to ''
            Will not create project on customvision.
        """
        project_obj = Project.objects.create(
            setting=Setting.objects.filter(name='valid_setting').first(),
            camera=Camera.objects.filter(name='demo_camera_1').first(),
            location=Location.objects.filter(name='demo_location_1').first(),
            customvision_project_id='5566thebest',
            customvision_project_name=f'{self.project_prefix}-test_create_3',
            is_demo=False)

        self.assertTrue(project_obj.customvision_project_id == '')

    def test_create_project(self):
        """test_create_project.

        Type:
            Positive

        Description:
            Create project with a valid setting.

        Expected results:
            Project created on custom vision.
            project_obj.customvision_project_id set.
        """
        project_obj = Project.objects.create(
            setting=Setting.objects.filter(name='valid_setting').first(),
            camera=Camera.objects.filter(name='demo_camera_1').first(),
            location=Location.objects.filter(name='demo_location_1').first(),
            is_demo=False,
            customvision_project_id='56cannotdie',
            customvision_project_name=f'{self.project_prefix}-test_update_1')

        # Check
        project_obj.save()
        self.assertEqual(project_obj.customvision_project_id, '')

        # Create project and check
        project_obj.create_project()
        self.assertNotEqual(project_obj.customvision_project_id, '')

    def test_update_1(self):
        """test_update_1
        Type:
            Negative

        Description:
            Update customvision_project_id with an invalid string.

        Expected result:
            After save called, customvision_project_id should be set to ''
        """
        project_obj = Project.objects.create(
            setting=Setting.objects.filter(name='valid_setting').first(),
            camera=Camera.objects.filter(name='demo_camera_1').first(),
            location=Location.objects.filter(name='demo_location_1').first(),
            is_demo=False,
            customvision_project_name=f'{self.project_prefix}-test_update_1')

        # Project already created
        project_obj.customvision_project_id = '56cannotdie'
        project_obj.save()
        self.assertTrue(project_obj.customvision_project_id == '')
