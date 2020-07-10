"""
Signals
"""

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from ..azure_settings.models import Setting
from .models import Project

logger = logging.getLogger(__name__)


@receiver(signal=post_save,
          sender=Setting,
          dispatch_uid="delete_project_on_setting_change")
def azure_setting_change_handler(**kwargs):
    """
    Listen on azure_settings.models.Setting Change.
    Delete project under this setting
    """
    logger.info("Azure Setting changed")
    logger.info("Deleting all none-demo project....")
    if 'sender' not in kwargs or kwargs['sender'] != Setting:
        return
    if 'instance' not in kwargs:
        return
    Project.objects.filter(setting=kwargs['instance'], is_demo=False).delete()
    Project.objects.update_or_create(setting=kwargs['instance'], is_demo=False)
