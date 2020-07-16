"""
Locations App
"""
import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class LocationsConfig(AppConfig):
    """
    Locations App Config
    """
    name = 'vision_on_edge.locations'

    def ready(self):
        """
        Only load to data when runserver
        if ready run in migration will failed
        """
        if 'runserver' in sys.argv:
            # pylint: disable=C0415
            from .models import Location
            # pylint: enable=C0415

            logger.info("Locations App Config ready while running server")

            create_demo = True
            if create_demo:
                logger.info("Creating Demo Location")
                Location.objects.update_or_create(name="Demo Location",
                                                  is_demo=True,
                                                  defaults={
                                                      'description':
                                                          "Demo Location",
                                                  })

            logger.info("Locations App Config End while running server")
