# -*- coding: utf-8 -*-
"""App.
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


# pylint: disable=C0415
class CamerasConfig(AppConfig):
    """App Config.
    """

    name = 'vision_on_edge.cameras'

    def ready(self):
        """ready.
        """

        if 'runserver' in sys.argv:
            from .models import Camera
            from ..locations.models import Location

            logger.info("App ready ready while running server")
            create_demo = True
            if create_demo:

                logger.info("Creating a demo camera object.")

                if not Location.objects.filter(is_demo=True).exists():
                    return
                demo_location_obj = Location.objects.filter(
                    is_demo=True).first()
                Camera.objects.update_or_create(
                    name="Demo Video",
                    is_demo=True,
                    defaults={
                        'rtsp': 'rtsp://rtspsim:554/media/video.mkv',
                        'area': "",
                        'location': demo_location_obj
                    })
                logger.info("Creating demo objects... end")


                # Scenario 1
                logger.info("Creating a scenario 1 camera object.")

                if not Location.objects.filter(is_demo=True).exists():
                    return
                demo_location_obj = Location.objects.filter(
                    is_demo=True).first()
                Camera.objects.update_or_create(
                    name="Scenario 1 - Counting Objects",
                    is_demo=True,
                    defaults={
                        'rtsp': 'rtsp://rtspsim:554/media/scenario1-counting-objects.mkv',
                        'area': "",
                        'location': demo_location_obj
                    })
                logger.info("Creating scenario 3 ... end")


                # Scenario 2
                logger.info("Creating a scenario 2 employ safety.")

                if not Location.objects.filter(is_demo=True).exists():
                    return
                demo_location_obj = Location.objects.filter(
                    is_demo=True).first()
                Camera.objects.update_or_create(
                    name="Scenario 2 - Employ Safety",
                    is_demo=True,
                    defaults={
                        'rtsp': 'rtsp://rtspsim:554/media/scenario2-employ-safety.mkv',
                        'area': "",
                        'location': demo_location_obj
                    })
                logger.info("Creating scenario 2... end")


                # Scenario 3
                logger.info("Creating a scenario 3 defect detection.")

                if not Location.objects.filter(is_demo=True).exists():
                    return
                demo_location_obj = Location.objects.filter(
                    is_demo=True).first()
                Camera.objects.update_or_create(
                    name="Scenario 3 - Defect Detection",
                    is_demo=True,
                    defaults={
                        'rtsp': 'rtsp://rtspsim:554/media/scenario3-defect-detection.mkv',
                        'area': "",
                        'location': demo_location_obj
                    })
                logger.info("Creating scenario 3... end")

            logger.info("App ready end while running server")
