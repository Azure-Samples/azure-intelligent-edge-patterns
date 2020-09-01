# -*- coding: utf-8 -*-
"""App
"""

import logging
import sys

from django.apps import AppConfig

from vision_on_edge.azure_iot.utils import inference_module_url

logger = logging.getLogger(__name__)


class InferenceModulesConfig(AppConfig):
    """App Config"""

    name = 'vision_on_edge.inference_modules'

    def ready(self):
        """App ready

        Import signals and create some demo objects.
        """

        if 'runserver' in sys.argv:
            # pylint: disable=C0415
            from .models import InferenceModule
            # pylint: enable=C0415

            logger.info("App ready ready while running server")
            InferenceModule.objects.update_or_create(
                url=inference_module_url(),
                defaults={'name': 'default_inference_module'})

            logger.info("App ready end while running server")
