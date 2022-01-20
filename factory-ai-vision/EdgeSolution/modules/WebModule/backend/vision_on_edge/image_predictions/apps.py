"""App.
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class ImagePredictionsConfig(AppConfig):
    """App Config."""

    name = "vision_on_edge.image_predictions"

    def ready(self):
        """ready."""
        if "runserver" in sys.argv:
            logger.info("Image Prediction App Ready")
