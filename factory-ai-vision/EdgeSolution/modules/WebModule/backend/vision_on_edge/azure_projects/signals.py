"""App signals.
"""

import logging

from django.db.models.signals import pre_save
from django.dispatch import receiver

from ..azure_settings.models import Setting
from .models import Project

logger = logging.getLogger(__name__)


@receiver(
    signal=pre_save, sender=Setting, dispatch_uid="delete_project_on_setting_change"
)
def azure_setting_change_handler(**kwargs):
    """Azure Setting Change handler

    Delete project under this setting. However, since user
    may have just change the settings, project should not
    be deleted on Custom Vision.
    """
    logger.info("Azure Setting changed.")
    logger.info("Checking...")

    if "created" in kwargs:
        logger.info("Probably creating a new setting")
        logger.info("Nothing to do")
        return

    # Changing settings, not creating a new setting.
    instance = kwargs["instance"]
    old_setting = Setting.objects.get(pk=instance.id)
    if (
        old_setting.training_key == instance.training_key
        and old_setting.endpoint == instance.endpoint
    ):
        logger.info("Training Key and Endpoint not changed")
        logger.info("Nothing to do")
        return

    logger.info("Setting endpoint or training_key changed...")
    logger.info("Deleting all project belong this settings....")
    Project.objects.filter(setting=instance, is_demo=False).delete()
    logger.info("Creating a none-demo project....")
    if Project.objects.filter(setting=kwargs["instance"], is_demo=False).count() < 1:
        Project.objects.update_or_create(setting=kwargs["instance"], is_demo=False)
