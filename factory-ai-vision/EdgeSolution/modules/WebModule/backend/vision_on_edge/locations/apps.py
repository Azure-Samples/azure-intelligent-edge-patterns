"""App.
"""

import logging
import sys

from django.apps import AppConfig

from configs.general_configs import get_create_demo

logger = logging.getLogger(__name__)


class LocationsConfig(AppConfig):
    """App Config."""

    name = "vision_on_edge.locations"

    def ready(self):
        """ready."""
        if "runserver" in sys.argv:
            logger.info("App Config ready start while running server")
            # pylint: disable=import-outside-toplevel
            from .utils import create_demo_objects

            if get_create_demo():
                create_demo_objects()
            logger.info("App Config ready end while running server")
