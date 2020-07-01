"""
Azure Training App start
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
    name = 'azure_training'

    def ready(self):
        """
        Load default objects while runserver.
        Import models in migrate/makemigration will occurs error.
        """
        # FIXME test may use this as well
        if 'runserver' in sys.argv:
            from cameras.models import (Camera, Project, Train)  # pylint: disable=C0415
            from locations.models import Location  # pylint: disable=C0415
            from azure_settings.models import Setting  # pylint: disable=C0415

            logger.info("Azure Training AppConfig ready while running server")

            logger.info("Update or create a none-demo project...")
            _, created = Project.objects.update_or_create(is_demo=False)
            logger.info(
                "None-demo project found: %s. Default project created: %s",
                not created, created)

            create_demo = True
            if create_demo:
                # Demo Location should be created already
                demo_locations = Location.objects.filter(is_demo=True)
                demo_cameras = Camera.objects.filter(is_demo=True)
                default_settings = Setting.objects.filter(
                    name=DEFAULT_SETTING_NAME)
                if len(demo_cameras) <= 0:
                    return
                if len(demo_locations) <= 0:
                    return
                if len(default_settings) <= 0:
                    return

                logger.info("Creating Demo Project")
                demo_project, created = Project.objects.update_or_create(
                    is_demo=True,
                    defaults={
                        'setting': default_settings.first(),
                        'camera': demo_cameras.first(),
                        'location': demo_locations.first(),
                    })

                _, created = Train.objects.update_or_create(
                    project=demo_project,
                    defaults={
                        'status': 'demo ok',
                        'log': 'demo log',
                        'performance': 1,
                    })
                logger.info("Creating Demo... End")

            logger.info("Azure Training AppConfig End while running server")
