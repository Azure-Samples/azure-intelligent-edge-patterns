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
                        'rtsp': 'sample_video/video.mp4',
                        'area': "",
                        'location': demo_location_obj
                    })
                logger.info("Creating demo objects... end")

            logger.info("App ready end while running server")
