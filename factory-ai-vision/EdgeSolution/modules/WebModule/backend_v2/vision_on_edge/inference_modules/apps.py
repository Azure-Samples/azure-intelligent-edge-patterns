# -*- coding: utf-8 -*-
"""App.
"""

import logging
import sys

from django.apps import AppConfig
from vision_on_edge.azure_iot.utils import inference_module_url

logger = logging.getLogger(__name__)


class InferenceModulesConfig(AppConfig):
    """App Config.
    """

    name = 'vision_on_edge.inference_modules'

    def ready(self):
        """ready.
        """

        if 'runserver' in sys.argv:
            from .models import InferenceModule

            logger.info("App ready ready while running server")
            InferenceModule.objects.update_or_create(
                url=inference_module_url(),
                defaults={'name': 'default_inference_module'})

            logger.info("App ready end while running server")
