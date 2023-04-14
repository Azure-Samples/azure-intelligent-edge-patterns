"""App models.
"""

import logging
import json

from django.db import models
from django.db.models.signals import post_save

from ..azure_app_insight.utils import get_app_insight_logger
from ..azure_settings.models import Setting

logger = logging.getLogger(__name__)


class Feedback(models.Model):
    """Feedback Model."""

    VERYBAD = "VB"
    POOR = "PR"
    FAIR = "FR"
    GOOD = "GD"
    EXCELLENT = "EX"
    SATISFACTION_CHOCES = [
        (EXCELLENT, "Excellent"),
        (GOOD, "Good"),
        (FAIR, "Fair"),
        (POOR, "Poor"),
        (VERYBAD, "Very Bad"),
    ]
    satisfaction = models.CharField(
        max_length=2, choices=SATISFACTION_CHOCES, default=FAIR
    )

    @staticmethod
    def post_save(**kwargs):
        """post_save.

        Args:
            kwargs:
        """
        instance = kwargs["instance"]
        logger.warning("Satisfaction: %s", instance.satisfaction)

        # Escape from test
        if (
            Setting.objects.first() is not None
            and Setting.objects.first().is_collect_data
        ):
            az_logger = get_app_insight_logger()
            az_logger.warning(
                "feedback",
                extra={"custom_dimensions": {"satisfaction": instance.satisfaction}},
            )


post_save.connect(Feedback.post_save, Feedback, dispatch_uid="Feedback_post")
