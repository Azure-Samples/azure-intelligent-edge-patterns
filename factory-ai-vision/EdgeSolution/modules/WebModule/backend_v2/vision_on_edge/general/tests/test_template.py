# -*- coding: utf-8 -*-
"""Testing Template

Test Description
"""

import logging

from vision_on_edge.general.tests.azure_testcase import CustomVisionTestCase

logger = logging.getLogger(__name__)


class TemplateTestCase(CustomVisionTestCase):
    """TemplateTestCase

    Template testcases.
    """

    def setUp(self):
        logger.info(self.training_key)
        logger.info(self.endpoint)
        logger.info(self.project_prefix)
        logger.info(self.trainer)

    def test_setup_is_valid(self):
        """test_setup_is_valid.

        Make sure setup is valid
        """

    def test_1(self):
        """test_1

        Type:
            Positive/Negative/Marginal

        Description:
            Test case 1 description.

        Expected Results:
            pass
        """
