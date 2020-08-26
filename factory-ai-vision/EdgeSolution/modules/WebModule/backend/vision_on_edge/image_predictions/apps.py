"""
Image Prediction App
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class ImagePredictionsConfig(AppConfig):
    """
    Image Prediction App Config.
    This App should run after project App
    """
    name = 'vision_on_edge.image_predictions'

    def ready(self):
        """
        Only load to data when runserver
        if ready run in migration will failed.
        """
        if 'runserver' in sys.argv:
            logger.info("Image Prediction App Ready")
