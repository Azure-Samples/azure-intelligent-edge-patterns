"""
Notification Signals
"""

import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import Notification

logger = logging.getLogger(__name__)


@receiver(signal=post_save,
          sender=Notification,
          dispatch_uid="send_to_websocket")
def notification_post_save_websocket_handler(**kwargs):
    """notification_post_save_websocket_handler.

    When there is a notification been save, push to channel
    layer to send to websocket.

    Args:
        kwargs:
    """

    logger.info("notification_post_save...")
    if "instance" not in kwargs:
        return
    logger.info("Sending notifications...")

    instance = kwargs['instance']
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
            "details": instance.details
        },
    )


@receiver(signal=pre_save,
          sender=Notification,
          dispatch_uid="dequeue_notification")
def notification_post_save_dequeue_handler(**kwargs):
    """notification_post_save_dequeue_handler.

    When a new notification been created, delete the
    earliest notification with same sender.

    Args:
        kwargs:
    """

    logger.info("dequeue notification...")
    if "instance" not in kwargs:
        return

    instance = kwargs['instance']
    if Notification.objects.filter(sender=instance.sender).count() >= 10:
        Notification.objects.filter(
            sender=instance.sender).order_by('timestamp').first().delete()
