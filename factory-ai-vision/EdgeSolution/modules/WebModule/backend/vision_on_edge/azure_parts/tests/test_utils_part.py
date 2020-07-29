# -*- coding: utf-8 -*-
"""
Testing utilities
"""

import logging

from vision_on_edge.general.tests.azure_testcase import CustomVisionTestCase
from vision_on_edge.azure_settings.models import Setting
from vision_on_edge.azure_training.models import Project
from vision_on_edge.azure_parts.models import Part
from vision_on_edge.azure_parts.utils import (
    upload_part_to_customvision_helper, batch_upload_parts_to_customvision)
logger = logging.getLogger(__name__)


class PartUtilTestCase(CustomVisionTestCase):
    """
    Testing part utilities
    """

    def setUp(self):
        """
        Create setting, camera, location and parts.
        """
        Setting.objects.create(name="defualt_setting",
                               training_key=self.training_key,
                               endpoint=self.endpoint)
        Project.objects.create(setting=Setting.objects.get(),
                               customvision_project_name=(self.project_prefix +
                                                          "test_part_utils"))

    def test_upload_single_part(self):
        """
        Type:
            Positive

        Description:
            Upload single part to Custom Vision

        Expected Results:
            pass
        """
        part_obj = Part.objects.create(name="test_part_1")
        Project.objects.get().create_project()

        upload_part_to_customvision_helper(project_id=Project.objects.get().id,
                                           part_id=part_obj.id)

        trainer = Setting.objects.first().get_trainer_obj()
        tags = trainer.get_tags(
            project_id=Project.objects.first().customvision_project_id)

        self.assertEqual(len(tags), 1)

    def test_upload_multi_parts(self):
        """
        Type:
            Positive

        Description:
            Upload single part to Custom Vision

        Expected Results:
            pass
        """
        for i in range(40):
            Part.objects.create(name=f"test_part_{i}")

        part_ids = [part.id for part in Part.objects.all()]
        Project.objects.get().create_project()
        batch_upload_parts_to_customvision(project_id=Project.objects.get().id,
                                           part_ids=part_ids)

        trainer = Setting.objects.first().get_trainer_obj()
        tags = trainer.get_tags(
            project_id=Project.objects.first().customvision_project_id)

        self.assertEqual(len(tags), 40)
