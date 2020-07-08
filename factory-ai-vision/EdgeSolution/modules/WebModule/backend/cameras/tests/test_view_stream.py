"""
Testing Stram API View
"""
import logging

from rest_framework.test import APITransactionTestCase

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

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """

    def test_valid_setting_list_project(self):
        """
        @Type

        @Description

        @Expected Results
        """

    def test_invalid_setting_list_project(self):
        """
        @Type

        @Description

        @Expected Results
        """
