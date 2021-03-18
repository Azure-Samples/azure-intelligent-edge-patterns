"""App signals.
"""

import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver

from ..azure_pd_deploy_status.models import DeployStatus
from ..azure_training_status.models import TrainingStatus
from .models import Notification

logger = logging.getLogger(__name__)


@receiver(signal=post_save, sender=Notification, dispatch_uid="send_to_websocket")
def notification_post_save_websocket_handler(**kwargs):
    """notification_post_save_websocket_handler.

    When there is a notification been save, push to channel
    layer to send to websocket.

    Args:
        kwargs:
    """

    logger.info("notification_post_save...")
    logger.info("Sending notifications...")

    instance = kwargs["instance"]
    channels_layer = get_channel_layer()
    async_to_sync(channels_layer.group_send)(
        "notification",
        {
            "id": instance.id,
            "type": "notification.send",
            "notification_type": instance.notification_type,
            "timestamp": str(instance.timestamp),
            "sender": instance.sender,
            "title": instance.title,
            "details": instance.details,
        },
    )


# @receiver(signal=pre_save,
# sender=Notification,
# dispatch_uid="dequeue_notification")
# def notification_post_save_dequeue_handler(**kwargs):
# """notification_post_save_dequeue_handler.

# When a new notification been created, delete the
# earliest notification with same sender.

# Args:
# kwargs:
# """

# logger.info("dequeue notification...")
# instance = kwargs['instance']
# if Notification.objects.filter(sender=instance.sender).count() >= 10:
# Notification.objects.filter(
# sender=instance.sender).order_by('timestamp').first().delete()


@receiver(
    signal=post_save, sender=TrainingStatus, dispatch_uid="training_status_listener"
)
def training_status_listener(**kwargs):
    """training_status_send_notification_handler.

    Args:
        kwargs:
    """
    instance = kwargs["instance"]
    if (
        hasattr(instance, "need_to_send_notification")
        and instance.need_to_send_notification
    ):
        logger.info("Azure TrainingStatus changed.")
        logger.info(
            "instance.need_to_send_notification %s", instance.need_to_send_notification
        )
        Notification.objects.create(
            notification_type="project",
            sender="system",
            title=instance.status.capitalize(),
            details=instance.log.capitalize(),
        )
    logger.info("Signal end")


@receiver(signal=post_save, sender=DeployStatus, dispatch_uid="deploy_status_listener")
def deploy_status_listener(**kwargs):
    """deploy_status_send_notification_handler.

    Args:
        kwargs:
    """
    instance = kwargs["instance"]
    if (
        hasattr(instance, "need_to_send_notification")
        and instance.need_to_send_notification
    ):
        logger.info("Azure TrainingStatus changed.")
        logger.info(
            "instance.need_to_send_notification %s", instance.need_to_send_notification
        )
        Notification.objects.create(
            notification_type="part_detection",
            sender="system",
            title=instance.status.capitalize(),
            details=instance.log.capitalize(),
        )
