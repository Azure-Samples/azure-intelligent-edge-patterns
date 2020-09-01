# -*- coding: utf-8 -*-
"""App.
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)

DEFAULT_SETTING_NAME = 'DEFAULT_SETTING'


class AzureProjectsConfig(AppConfig):
    """App Config.
    """

    name = 'vision_on_edge.azure_projects'

    def ready(self):
        """ready.
        """
        if 'runserver' in sys.argv:
            # pylint: disable=unused-import, import-outside-toplevel
            from . import signals
            from .models import Project
            from ..azure_settings.models import Setting

            logger.info("Create/update a none-demo project...")
            setting_obj = Setting.objects.first()
            if (not Project.objects.filter(setting=setting_obj,
                                           is_demo=False).exists()):
                Project.objects.create(setting=setting_obj, is_demo=False)

            create_demo = True
            if create_demo:
                # Default Settings should be created already
                default_settings = Setting.objects.filter(
                    name=DEFAULT_SETTING_NAME)
                if not default_settings.exists():
                    logger.info("Cannot find default settings....")
                    return
                if not Project.objects.filter(is_demo=True).exists():
                    logger.info("Creating demo project.")
                    Project.objects.update_or_create(
                        setting=default_settings.first(),
                        is_demo=True,
                    )
                logger.info("Create demo project end.")

            logger.info("Azure Training AppConfig End while running server")
