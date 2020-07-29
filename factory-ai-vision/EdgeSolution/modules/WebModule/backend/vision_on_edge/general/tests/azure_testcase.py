# -*- coding: utf-8 -*-
"""Custom Vision Test Case

This is a wrapper of APITransactionTestCase.

Requirements:
    * ENDPOINT, TRAINING_KEY in config.py is valid.
    * Custom Vision is able to create projects

Notes:
    * All test projects created on Azure Custom Vision
        will/should use name started with PROJECT_PREFIX.
    * All projects on Azure Custom Vision started with
        PROJECT_PREFIX will be deleted after testing.
"""

import logging

from azure.cognitiveservices.vision.customvision.training import CustomVisionTrainingClient
from rest_framework.test import APITransactionTestCase

from configs.customvision_config import ENDPOINT, TRAINING_KEY

logger = logging.getLogger(__name__)

class CustomVisionTestCase(APITransactionTestCase):
    """CustomVisionTestCase.

    Create project with:
        self.training_key
        self.endpoint
        self.project_prefix
    """

    def __init__(self, *args, **kwargs):
        super(CustomVisionTestCase, self).__init__(*args, **kwargs)
        self.project_prefix = "unit_test"
        self.endpoint = ENDPOINT
        self.training_key = TRAINING_KEY

    def setUp(self):
        """
        Create setting, camera, location and parts.
        """

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """

    def test_1(self):
        """
        @Type

        @Description

        @Expected Results
        """

    def tearDown(self, *args, **kwargs):
        trainer = CustomVisionTrainingClient(api_key=self.training_key,
                                             endpoint=self.endpoint)
        projects = trainer.get_projects()
        for project in projects:
            if project.name.find(self.project_prefix) == 0:
                logger.info("Deleting project %s", project.id)
                trainer.delete_project(project_id=project.id)

        super(CustomVisionTestCase, self).tearDown(*args, **kwargs)
