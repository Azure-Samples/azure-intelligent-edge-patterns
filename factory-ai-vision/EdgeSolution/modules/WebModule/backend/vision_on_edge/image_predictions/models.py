"""
Models for azure prediction
"""

import logging

from django.db import models
from django.db.models.signals import pre_save

logger = logging.getLogger(__name__)


class ImagePrediction(models.Model):
    """Image Prediction"""
    image = models.ImageField(upload_to="predictions/")
    predicted = models.BooleanField(default=False)

    @staticmethod
    def pre_save(instance, **kwags):
        """Image Prediction pre_save"""
        logger.info("Image Prediction Presave")
        if not instance.predicted:
            logger.info("Predictiing")
            # Do something here...


pre_save.connect(ImagePrediction.pre_save,
                 ImagePrediction,
                 dispatch_uid="ImagePrediction_pre")
