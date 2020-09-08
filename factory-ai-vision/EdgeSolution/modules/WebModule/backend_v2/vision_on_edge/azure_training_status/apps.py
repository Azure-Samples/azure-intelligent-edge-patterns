# -*- coding: utf-8 -*-
"""App.
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class AzureTrainingStatusConfig(AppConfig):
    """App Config
    """

    name = 'vision_on_edge.azure_training_status'

    def ready(self):
        """ready.
        """
        if 'runserver' in sys.argv:
            # pylint: disable=unused-import, import-outside-toplevel
            from . import signals
