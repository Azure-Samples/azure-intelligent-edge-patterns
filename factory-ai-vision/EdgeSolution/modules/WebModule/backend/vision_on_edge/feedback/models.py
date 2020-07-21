"""
Models
"""

import logging

from django.db import models
from django.db.models.signals import post_save

logger = logging.getLogger(__name__)


class Feedback(models.Model):
    """Feedback.
    """

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

    @staticmethod
    def post_save(**kwargs):
        """post_save.

        Args:
            kwargs:
        """
        if 'instance' not in kwargs:
            return
        instance = kwargs['instance']
        logger.warning('Satisfaction: %s', instance.satisfaction)


post_save.connect(Feedback.post_save, Feedback, dispatch_uid="Feedback_post")
