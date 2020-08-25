# -*- coding: utf-8 -*-
"""App
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class AzurePartDetectionConfig(AppConfig):
    """App Config
    """

    name = 'vision_on_edge.azure_part_detections'

    def ready(self):
        """Azure Training App Ready
        """

        if 'runserver' in sys.argv:
            # pylint: disable=unused-import, import-outside-toplevel
            logger.info("ready while running server")
            logger.info("Importing Signals")
            from . import signals
            from ..azure_projects.models import Project
            from ..cameras.models import Camera
            from ..locations.models import Location
            from ..inference_modules.models import InferenceModule
            # pylint: enable=unused-import, import-outside-toplevel
