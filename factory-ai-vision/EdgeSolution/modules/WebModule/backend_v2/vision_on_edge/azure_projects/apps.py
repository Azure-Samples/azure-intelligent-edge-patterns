"""App.
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)

DEFAULT_SETTING_NAME = "DEFAULT_SETTING"


class AzureProjectsConfig(AppConfig):
    """App Config."""

    name = "vision_on_edge.azure_projects"

    def ready(self):
        """ready."""
        if "runserver" in sys.argv:
            # pylint: disable=unused-import, import-outside-toplevel
            from ..azure_settings.models import Setting
            from . import signals
            from .models import Project

            logger.info("Create/update a none-demo project...")
            setting_obj = Setting.objects.first()
            if not Project.objects.filter(setting=setting_obj, is_demo=False).exists():
                Project.objects.create(setting=setting_obj, is_demo=False)

            create_demo = True
            if create_demo:
                logger.info("Creating demo projects...")
                # Default Settings should be created already
                default_settings = Setting.objects.filter(name=DEFAULT_SETTING_NAME)
                if not default_settings.exists():
                    logger.info("Cannot find default settings....")
                    return
                if Project.objects.filter(is_demo=True).exists():
                    Project.objects.filter(is_demo=True).delete()
                # =============================================
                # Simple Part Detection                     ===
                # =============================================
                Project.objects.update_or_create(
                    name="Demo Part Detection Project",
                    setting=default_settings.first(),
                    download_uri="default_model_6parts",
                    is_demo=True,
                )
                # =============================================
                # Part Counting                             ===
                # =============================================
                Project.objects.update_or_create(
                    name="Demo Part Counting Project",
                    setting=default_settings.first(),
                    is_demo=True,
                    defaults={"download_uri": "scenario_models/1"},
                )
                # =============================================
                # Employee safety                           ===
                # =============================================
                Project.objects.update_or_create(
                    name="Demo Employee Safety Project",
                    setting=default_settings.first(),
                    is_demo=True,
                    defaults={"download_uri": "scenario_models/2"},
                )
                # =============================================
                # Defect Detection                          ===
                # =============================================
                Project.objects.update_or_create(
                    name="Demo Defect Detection Project",
                    setting=default_settings.first(),
                    is_demo=True,
                    defaults={"download_uri": "scenario_models/3"},
                )
                logger.info("Create demo project end.")
