from django.db import models
import logging
# importing the built-in signal
from django.db.models.signals import pre_save, post_save
from django.contrib.auth.models import User

# Create your models here.


logger = logging.getLogger(__name__)


class Feedback(models.Model):
    VERYBAD = 'VB'
    POOR = 'PR'
    FAIR = 'FR'
    GOOD = 'GD'
    EXCELLENT = 'EX'
    SATISFACTION_CHOCES = [
        (EXCELLENT, 'Excellent'),
        (GOOD, 'Good'),
        (FAIR, 'Fair'),
        (POOR, 'Poor'),
        (VERYBAD, 'Very Bad'),
    ]
    satisfaction = models.CharField(
        max_length=2,
        choices=SATISFACTION_CHOCES,
        default=FAIR,
    )
    description = models.CharField(max_length=3000, default='')

    @staticmethod
    def post_save(instance, **kwargs):
        logger.warning(instance.description)


post_save.connect(Feedback.post_save, Feedback, dispatch_uid="Feedback_post")
