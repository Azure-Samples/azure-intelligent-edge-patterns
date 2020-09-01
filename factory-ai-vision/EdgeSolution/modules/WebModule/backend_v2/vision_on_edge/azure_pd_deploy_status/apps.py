# -*- coding: utf-8 -*-
"""App
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


# pylint: disable=unused-import, import-outside-toplevel
class AzurePDDeployStatusConfig(AppConfig):
    """App Config
    """

    name = 'vision_on_edge.azure_pd_deploy_status'

    def ready(self):
        """ready.
        """
        if 'runserver' in sys.argv:
            from . import signals
