# -*- coding: utf-8 -*-
"""App
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)

DEFAULT_SETTING_NAME = 'DEFAULT_SETTING'


class AzureTrainingConfig(AppConfig):
    """App Config

    Import signals and create demo objects.
    """

    name = 'vision_on_edge.azure_projects'

    def ready(self):
        """
        Azure Training App Ready
        """
        if 'runserver' in sys.argv:
            # pylint: disable=unused-import, import-outside-toplevel
            logger.info("ready while running server")
            logger.info("Importing Signals")
            # from . import signals
            from .models import Project
            from ..azure_settings.models import Setting

            logger.info("ready while running server")
            logger.info("Create/update a none-demo project...")
            setting_obj = Setting.objects.first()
            if (not Project.objects.filter(setting=setting_obj,
                                           is_demo=False).exists()):
                Project.objects.create(
                    setting=setting_obj, is_demo=False)

            create_demo = True
            if create_demo:
                # Default Settings should be created already
                default_settings = Setting.objects.filter(
                    name=DEFAULT_SETTING_NAME)
                if len(default_settings) <= 0:
                    return

                # Projects
                # if Project.objects.filter(is_demo=True).count() <= 1:
                    # logger.info("Creating demo project")
                    # Project.objects.update_or_create(
                        # is_demo=True,
                        # defaults={
                            # 'setting': default_settings.first(),
                        # })
                # Train is created by signals
                logger.info("Creating demo objects end.")

            logger.info("Azure Training AppConfig End while running server")
            # pylint: enable=unused-import, import-outside-toplevel
