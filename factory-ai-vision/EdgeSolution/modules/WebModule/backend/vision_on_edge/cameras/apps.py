"""App.
"""

import logging
import sys

from django.apps import AppConfig

from configs.general_configs import get_create_demo

logger = logging.getLogger(__name__)


# pylint: disable=C0415
class CamerasConfig(AppConfig):
    """App Config."""

    name = "vision_on_edge.cameras"

    def ready(self):
        """ready."""

        if "runserver" in sys.argv:
            from .helpers import create_demo_objects

            logger.info("App ready ready while running server")
            if get_create_demo():
                create_demo_objects()

            logger.info("App ready end while running server")
