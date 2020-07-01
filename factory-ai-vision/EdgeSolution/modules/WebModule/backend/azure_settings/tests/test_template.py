"""
Testing Stram API View
"""
import logging

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITransactionTestCase

from config import ENDPOINT, TRAINING_KEY

PROJECT_PREFIX = "UnitTest"

logger = logging.getLogger(__name__)


class StreamViewTestCase(APITransactionTestCase):
    """
    Testing stream api view
    """

    def setUp(self):
        """
        Create setting, camera, location and parts.
        """
        pass

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """
        pass

    def test_valid_setting_list_project(self):
        """
        @Type

        @Description

        @Expected Results
        """
        pass

    def test_invalid_setting_list_project(self):
        """
        @Type

        @Description

        @Expected Results
        """
        pass

    @classmethod
    def tearDownClass(cls):
        trainer = CustomVisionTrainingClient(
            api_key=TRAINING_KEY, endpoint=ENDPOINT)
        projects = trainer.get_projects()
        for project in projects:
            if project.name.find(PROJECT_PREFIX) == 0:
                trainer.delete_project(project_id=project.id)
