"""
Camera App start
"""
import logging
import sys

from django.apps import AppConfig

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
            from cameras.models import (Part, Camera, Project, Train)  # pylint: disable=C0415
            from locations.models import Location  # pylint: disable=C0415
            from azure_settings.models import Setting  # pylint: disable=C0415

            logger.info("CameraAppConfig ready while running server")

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
                    _, created = Part.objects.update_or_create(
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
                # FIXME split location from project, and remove location here
                demo_locations = Location.objects.filter(is_demo=True)
                if len(demo_locations) <= 0:
                    return
                default_settings = Setting.objects.filter(
                    name=DEFAULT_SETTING_NAME)
                if len(default_settings) <= 0:
                    return

                logger.info("Creating Demo Project")
                demo_project, created = Project.objects.update_or_create(
                    is_demo=True,
                    defaults={
                        'setting': default_settings.first(),
                        'camera': demo_camera,
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
            demo_locations = Location.objects.filter(is_demo=True)
            if len(demo_locations) <= 0:
                return

            # Create default project
            # FIXME is DEMO = False, will not have camera, location to assign
            _, created = Project.objects.update_or_create(
                is_demo=False,
                defaults={
                    'camera': demo_camera,
                    'location': demo_locations.first()
                })
            logger.info(
                "None demo project found: %s. Default project created: %s",
                not created, created)
            logger.info("CameraAppConfig End while running server")
