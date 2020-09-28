# -*- coding: utf-8 -*-
"""Azure Setting REST API testcases.
"""

import logging

from vision_on_edge.general.tests.azure_testcase import CustomVisionTestCase

logger = logging.getLogger(__name__)


class AzureSettingRestTests(CustomVisionTestCase):
    """AzureSettingRestTests.

    Azure Setting REST API testcases.
    """

    def setUp(self):
        """setUp.
        """
