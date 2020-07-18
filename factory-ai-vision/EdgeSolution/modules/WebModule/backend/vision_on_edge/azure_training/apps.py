"""
Azure Training App
"""
import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)

DEFAULT_SETTING_NAME = 'DEFAULT_SETTING'


class AzureTrainingConfig(AppConfig):
    """
    Azure Training App Config
    """
    name = 'vision_on_edge.azure_training'

    def ready(self):
        """
        Azure Training App Ready
        """
        if 'runserver' in sys.argv:
            # pylint: disable=unused-import, import-outside-toplevel
            from vision_on_edge.azure_training import signals
            from .models import Project, Train
            from ..cameras.models import Camera
            from ..locations.models import Location
            from ..azure_settings.models import Setting

            logger.info("ready while running server")
            logger.info("Create/update a none-demo project...")
            _, created = Project.objects.update_or_create(is_demo=False)
            logger.info(
                "None-demo project found: %s. Default project created: %s",
                not created, created)

            create_demo = True
            if create_demo:
                # Demo Location should be created already
                demo_locations = Location.objects.filter(is_demo=True)
                if len(demo_locations) <= 0:
                    return

                # Demo Camera should be created already
                demo_cameras = Camera.objects.filter(is_demo=True)
                if len(demo_cameras) <= 0:
                    return

                # Default Settings should be created already
                default_settings = Setting.objects.filter(
                    name=DEFAULT_SETTING_NAME)
                if len(default_settings) <= 0:
                    return

                logger.info("Creating demo project")
                Project.objects.update_or_create(
                    is_demo=True,
                    defaults={
                        'setting': default_settings.first(),
                        'camera': demo_cameras.first(),
                        'location': demo_locations.first(),
                    })
                # Train is created by signals
                logger.info("Creating demo objects end.")

            logger.info("Azure Training AppConfig End while running server")
            # pylint: enable=unused-import, import-outside-toplevel
