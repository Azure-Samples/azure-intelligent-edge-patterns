"""App"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class CamerasConfig(AppConfig):
    """App Config"""

    name = 'vision_on_edge.cameras'

    def ready(self):
        """App ready

        Import signals and create some demo objects.
        """

        if 'runserver' in sys.argv:
            # pylint: disable=C0415
            from .models import Camera
            from ..locations.models import Location
            # pylint: enable=C0415

            logger.info("App ready ready while running server")

            create_demo = True

            if create_demo:
                logger.info("Creating a demo camera object.")
                # Demo Location should be created already
                demo_locations = Location.objects.filter(is_demo=True)
                if not demo_locations.exists():
                    return
                Camera.objects.update_or_create(
                    name="Demo Video",
                    is_demo=True,
                    defaults={
                        'rtsp': 'sample_video/video.mp4',
                        'area': "",
                        'location': demo_locations.first()
                    })

                logger.info("Creating demo objects... end")

            logger.info("App ready end while running server")
