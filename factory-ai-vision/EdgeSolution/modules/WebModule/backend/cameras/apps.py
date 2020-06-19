from django.apps import AppConfig
from config import *

import logging
import sys
import threading
import time

logger = logging.getLogger(__name__)


class CameraConfig(AppConfig):
    name = 'cameras'

    def ready(self):
        if 'runserver' in sys.argv:
            from cameras.models import Part, Camera, Location, Project, Train, Image, Setting
            logger.info("CameraAppConfig ready while running server")
            DEFAULT_SETTING_NAME = 'DEFAULT_SETTING'

            existing_settings = Setting.objects.filter(
                name=DEFAULT_SETTING_NAME,
                training_key=TRAINING_KEY,
                endpoint=ENDPOINT)
            if len(existing_settings) == 1:
                logger.info(
                    f"Found existing {DEFAULT_SETTING_NAME}. Revalidating in pre_save...")
                default_setting = existing_settings[0]
                default_setting.save()

            elif len(Setting.objects.filter(
                    name=DEFAULT_SETTING_NAME)) > 0:
                logger.info(
                    f"Found existing {DEFAULT_SETTING_NAME} with different (Endpoint, key)")
                logger.info(f"User may already changed the key ")
                # settings_with_dup_name.delete()
                default_setting = Setting.objects.filter(
                    name=DEFAULT_SETTING_NAME)[0]
                default_setting.save()

            elif len(Setting.objects.filter(
                    endpoint=ENDPOINT,
                    training_key=TRAINING_KEY)) > 0:
                logger.info(
                    f"Found existing (Endpoint, key) with different setting name")
                logger.info(f"Pass...")

                default_setting = Setting.objects.filter(
                    endpoint=ENDPOINT,
                    training_key=TRAINING_KEY)[0]
                default_setting.save()
            else:
                logger.info(f"Creating new {DEFAULT_SETTING_NAME}")
                default_setting, created = Setting.objects.update_or_create(
                    name=DEFAULT_SETTING_NAME,
                    training_key=TRAINING_KEY,
                    endpoint=ENDPOINT,
                    iot_hub_connection_string=IOT_HUB_CONNECTION_STRING,
                    device_id=DEVICE_ID,
                    module_id=MODULE_ID
                )
                if not created:
                    logger.error(
                        f"{DEFAULT_SETTING_NAME} not created. Something went wrong")

            create_demo = True
            if create_demo:
                logger.info("Creating Demo Parts")
                # for partname in ['Box', 'Barrel', 'Hammer', 'Screwdriver', 'Bottle', 'Plastic bag']:
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
                        defaults={
                            'description': "Demo"
                        }
                    )

                logger.info("Creating Demo Camera")
                demo_camera, created = Camera.objects.update_or_create(
                    name="Demo Video",
                    is_demo=True,
                    defaults={
                        'rtsp': 'sample_video/video_1min.mp4',
                        'area': ""
                    }
                )

                logger.info("Creating Demo Location")
                demo_location, created = Location.objects.update_or_create(
                    name="Demo Location",
                    is_demo=True,
                    defaults={
                        'description': "Demo Location",
                    }
                )

                logger.info("Creating Demo Project")
                demo_project, created = Project.objects.update_or_create(
                    is_demo=True,
                    defaults={
                        'setting': default_setting,
                        'camera': demo_camera,
                        'location': demo_location, })

                demo_train, created = Train.objects.update_or_create(
                    project=demo_project,
                    defaults={
                        'status': 'demo ok',
                        'log': 'demo log',
                        'performance': 1, })
                logger.info("Creating Demo... End")

            default_project, created = Project.objects.update_or_create(
                is_demo=False,
                defaults={
                    'camera': demo_camera,
                    'location': demo_location})
            logger.info(
                f"None demo project found: {not created}. Default project created: {created}")
            logger.info("CameraAppConfig End while running server")
