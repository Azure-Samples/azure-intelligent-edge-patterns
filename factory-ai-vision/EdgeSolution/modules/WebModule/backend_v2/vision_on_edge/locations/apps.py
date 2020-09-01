# -*- coding: utf-8 -*-
"""App
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)

# pylint: disable=C0415


class LocationsConfig(AppConfig):
    """App Config
    """
    name = 'vision_on_edge.locations'

    def ready(self):
        """ready.
        """
        if 'runserver' in sys.argv:
            from .models import Location

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
