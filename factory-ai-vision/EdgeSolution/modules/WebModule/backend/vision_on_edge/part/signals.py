"""
Part Signals
"""

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from ..azure_settings.models import Setting
from .models import Part

logger = logging.getLogger(__name__)


@receiver(signal=post_save,
          sender=Setting,
          dispatch_uid="delete_part_on_setting_change")
def azure_setting_change_handler(**kwargs):
    """
    Listen on azure_settings.models.Setting change.
    Delete all none-demo parts.
    """
    logger.info("Azure Setting changed")
    logger.info("Deleting all none-demo part....")
    if 'sender' not in kwargs or kwargs['sender'] != Setting:
        return
    if 'instance' not in kwargs:
        return
    Part.objects.filter(is_demo=False).delete()
