"""
App start
"""
import logging
import sys

from django.apps import AppConfig

from configs.customvision_config import ENDPOINT, TRAINING_KEY
from configs.iot_config import IOT_HUB_CONNECTION_STRING, DEVICE_ID, MODULE_ID

logger = logging.getLogger(__name__)

DEFAULT_SETTING_NAME = 'DEFAULT_SETTING'


class CameraConfig(AppConfig):
    """
    Camera App Config
    """
    name = 'cameras'

    def ready(self):
        """
        Only load to data when runserver
        if ready run in migration will failed
        """
        # FIXME test may use this as well
        if 'runserver' in sys.argv:
            from cameras.models import (Part, Camera, Project, Train, Setting)
            from locations.models import Location
            logger.info("CameraAppConfig ready while running server")

            existing_settings = Setting.objects.filter(
                name=DEFAULT_SETTING_NAME,
                training_key=TRAINING_KEY,
                endpoint=ENDPOINT)
            if len(existing_settings) == 1:
                logger.info("Found existing %s. Revalidating in pre_save...",
                            DEFAULT_SETTING_NAME)
                default_setting = existing_settings[0]
                default_setting.save()

            elif len(Setting.objects.filter(name=DEFAULT_SETTING_NAME)) > 0:
                logger.info("Found existing %s with different (Endpoint, key)",
                            DEFAULT_SETTING_NAME)
                logger.info("User may already changed the key ")
                # settings_with_dup_name.delete()
                default_setting = Setting.objects.filter(
                    name=DEFAULT_SETTING_NAME)[0]
                default_setting.save()

            elif len(
                    Setting.objects.filter(endpoint=ENDPOINT,
                                           training_key=TRAINING_KEY)) > 0:
                logger.info(
                    "Found existing (Endpoint, key) with different setting name"
                )
                logger.info("Pass...")

                default_setting = Setting.objects.filter(
                    endpoint=ENDPOINT, training_key=TRAINING_KEY)[0]
                default_setting.save()
            else:
                logger.info("Creating new %s", DEFAULT_SETTING_NAME)
                default_setting, created = Setting.objects.update_or_create(
                    name=DEFAULT_SETTING_NAME,
                    training_key=TRAINING_KEY,
                    endpoint=ENDPOINT,
                    iot_hub_connection_string=IOT_HUB_CONNECTION_STRING,
                    device_id=DEVICE_ID,
                    module_id=MODULE_ID)
                if not created:
                    logger.error("%s not created. Something went wrong",
                                 DEFAULT_SETTING_NAME)

            create_demo = True
            if create_demo:
                logger.info("Creating Demo Parts")
                # for partname in ['Box', 'Barrel', 'Hammer',
                #   'Screwdriver', 'Bottle', 'Plastic bag']:
                for partname in [
                        'aeroplane',
                        'bicycle',
                        'bird',
                        'boat',
                        'bottle',
                        'bus',
                        'car',
                        'cat',
                        'chair',
                        'cow',
                        'diningtable',
                        'dog',
                        'horse',
                        'motorbike',
                        'person',
                        'pottedplant',
                        'sheep',
                        'sofa',
                        'train',
                        'tvmonitor',
                ]:
                    demo_part, created = Part.objects.update_or_create(
                        name=partname,
                        is_demo=True,
                        defaults={'description': "Demo"})

                logger.info("Creating Demo Camera")
                demo_camera, created = Camera.objects.update_or_create(
                    name="Demo Video",
                    is_demo=True,
                    defaults={
                        'rtsp': 'sample_video/video.mp4',
                        'area': ""
                    })

                logger.info("Creating Demo Location")
                # Demo Location should be created already
                # FIXME : split location from project, and remove location here
                demo_locations = Location.objects.filter(is_demo=True)
                if len(demo_locations) <= 0:
                    return

                logger.info("Creating Demo Project")
                demo_project, created = Project.objects.update_or_create(
                    is_demo=True,
                    defaults={
                        'setting': default_setting,
                        'camera': demo_camera,
                        'location': demo_locations.first(),
                    })

                demo_train, created = Train.objects.update_or_create(
                    project=demo_project,
                    defaults={
                        'status': 'demo ok',
                        'log': 'demo log',
                        'performance': 1,
                    })
                logger.info("Creating Demo... End")
            demo_locations = Location.objects.filter(is_demo=True)
            if len(demo_locations) <= 0:
                return

            # FIXME: is DEMO = False, will not have camera, location to assign
            default_project, created = Project.objects.update_or_create(
                is_demo=False,
                defaults={
                    'camera': demo_camera,
                    'location': demo_locations.first()
                })
            logger.info(
                "None demo project found: %s. Default project created: %s",
                not created, created)
            logger.info("CameraAppConfig End while running server")
