# -*- coding: utf-8 -*-
"""CustomVisionTestCase

import CustomVisionTestCase.
"""

import logging

from azure.cognitiveservices.vision.customvision.training import \
    CustomVisionTrainingClient
from rest_framework.test import APITransactionTestCase

from configs.customvision_config import ENDPOINT, TRAINING_KEY

logger = logging.getLogger(__name__)


class CustomVisionTestCase(APITransactionTestCase):
    """CustomVisionTestCase.

    This is a wrapper of APITransactionTestCase.

    Attributes:
        self.training_key
        self.endpoint
        self.project_prefix
        self.trainer

    Requirements:
        * ENDPOINT, TRAINING_KEY in config.py/env is valid.
        * Custom Vision have space for new projects.

    Notes:
        * All test projects created on Azure Custom Vision
            should have prefix: self.project_prefix.
            e.g. f"{self.project_prefix}-test1"
        * All projects on Azure Custom Vision started with
            self.project_prefix will be deleted at tearDown.
    """

    def __init__(self, *args, **kwargs):
        super(CustomVisionTestCase, self).__init__(*args, **kwargs)
        self.project_prefix = "unit_test"
        self.endpoint = ENDPOINT
        self.training_key = TRAINING_KEY
        self.trainer = CustomVisionTrainingClient(api_key=self.training_key,
                                                  endpoint=self.endpoint)

    def tearDown(self, *args, **kwargs):
        trainer = CustomVisionTrainingClient(api_key=self.training_key,
                                             endpoint=self.endpoint)
        projects = trainer.get_projects()
        for project in projects:
            if project.name.find(self.project_prefix) == 0:
                logger.info("Deleting project %s", project.id)
                trainer.delete_project(project_id=project.id)

        super(CustomVisionTestCase, self).tearDown(*args, **kwargs)
