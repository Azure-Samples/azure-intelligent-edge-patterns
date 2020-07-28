# -*- coding: utf-8 -*-
"""Custom Vision Test Case

This is a wrapper of APITransactionTestCase.

Delete project starting with PROJECT_PREFIX on TearDown
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
