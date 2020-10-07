"""App signals.
"""

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from ..azure_part_detections.models import PartDetection
from .models import DeployStatus

logger = logging.getLogger(__name__)


@receiver(
    signal=post_save,
    sender=PartDetection,
    dispatch_uid="part_detection_create_listener",
)
def part_detection_create_listener(**kwargs):
    """part_detection_create_listener.

    If a PartDetection is created, create a DeployStatus for it.
    """
    instance = kwargs["instance"]
    created = kwargs["created"]
    if created:
        logger.info("PartDetection created. Create DeployStatus")
        DeployStatus.objects.update_or_create(
            part_detection_id=instance.id,
            defaults={"status": "ok", "log": "Has not deployed"},
        )
    else:
        logger.info("PartDetection modified. Pass...")
