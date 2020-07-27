"""App Signals
"""

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from vision_on_edge.azure_training_status.models import TrainingStatus
from vision_on_edge.notifications.models import Notification

from .models import Project

logger = logging.getLogger(__name__)


@receiver(signal=post_save,
          sender=TrainingStatus,
          dispatch_uid="training_status_send_notification")
def training_status_send_notification_handler(**kwargs):
    """training_status_send_notification_handler.

    Args:
        kwargs:
    """

    logger.info("Azure Project changed.")
    logger.info("Checking...")

    if 'sender' not in kwargs or kwargs['sender'] != TrainingStatus:
        logger.info(
            "'sender' not in kwargs or kwargs['sender'] != TrainingStatus")
        logger.info("nothing to do")
        return
    if 'instance' not in kwargs:
        logger.info("'instance' not in kwargs:'")
        logger.info("Nothing to do")
        return

    instance = kwargs['instance']
    if 'need_to_send_notification' in dir(
            instance) and instance.need_to_send_notification:
        Notification.objects.create(notification_type="project",
                                    sender="system",
                                    title=instance.status.capitalize(),
                                    details=instance.log.capitalize())
    logger.info("Signal end")
