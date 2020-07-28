# -*- coding: utf-8 -*-
"""
Testing Template
"""

import logging

from .customvision_testcase import CustomVisionTestCase

logger = logging.getLogger(__name__)


class TemplateTestCase(CustomVisionTestCase):
    """
    Test case template
    """

    def setUp(self):
        logger.info(self.training_key)
        logger.info(self.endpoint)
        logger.info(self.project_prefix)

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """

    def test_1(self):
        """
        Type:
            Positive/Negative/Marginal

        Description:
            Test case 1 description.

        Expected Results:
            pass
        """
