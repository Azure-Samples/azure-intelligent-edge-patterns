"""
Cameras App
"""
import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class CamerasConfig(AppConfig):
    """
    Cameras App Config
    """
    name = 'vision_on_edge.cameras'

    def ready(self):
        """
        Cameras App ready
        """
        # FIXME test may use this as well
        if 'runserver' in sys.argv:
            # Import models in migrate/makemigration will occurs error.
            # pylint: disable=C0415
            from vision_on_edge.cameras.models import Camera
            # pylint: enable=C0415

            logger.info("Camera App Config ready while running server")

            create_demo = True
            if create_demo:
                logger.info("Creating Demo Camera")
                Camera.objects.update_or_create(
                    name="Demo Video",
                    is_demo=True,
                    defaults={
                        'rtsp': 'sample_video/video.mp4',
                        'area': ""
                    })

                logger.info("Creating Demo... End")

            logger.info("Cameras AppConfig end while running server")
