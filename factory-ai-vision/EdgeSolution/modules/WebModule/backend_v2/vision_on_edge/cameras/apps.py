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
            from vision_on_edge.cameras.models import Camera
            # pylint: enable=C0415

            logger.info("App ready ready while running server")

            create_demo = True
            if create_demo:
                logger.info("Creating a demo camera object.")
                Camera.objects.update_or_create(
                    name="Demo Video",
                    is_demo=True,
                    defaults={
                        'rtsp': 'sample_video/video.mp4',
                        'area': ""
                    })

                logger.info("Creating demo objects... end")

            logger.info("App ready end while running server")
