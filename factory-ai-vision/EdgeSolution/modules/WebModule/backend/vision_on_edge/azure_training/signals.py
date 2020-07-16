"""
Signals
"""

import logging

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from ..azure_settings.models import Setting
from .models import Project, Train

logger = logging.getLogger(__name__)


@receiver(signal=pre_save,
          sender=Setting,
          dispatch_uid="delete_project_on_setting_change")
def azure_setting_change_handler(**kwargs):
    """
    Listen on azure_settings.models.Setting Change.
    Delete project under this setting
    """
    logger.info("Azure Setting changed.")
    logger.info("Checking...")

    if 'sender' not in kwargs or kwargs['sender'] != Setting:
        logger.info("'sender' not in kwargs or kwargs['sender'] != setting")
        logger.info("nothing to do")
        return
    if 'instance' not in kwargs:
        logger.info("'instance' not in kwargs:'")
        logger.info("Nothing to do")
        return
    instance = kwargs['instance']
    if len(Setting.objects.filter(pk=instance.id)) <= 0:
        logger.info("Probably creating a new setting")
        logger.info("Nothing to do")
        return
    old_setting = Setting.objects.get(pk=instance.id)
    if old_setting.training_key == instance.training_key and \
            old_setting.endpoint == instance.endpoint:
        logger.info("Training Key and Endpoint not changed")
        logger.info("Nothing to do")
        return

    logger.info("Setting endpoint or training_key changed...")
    logger.info("Deleting all none-demo project....")
    Project.objects.filter(setting=kwargs['instance'], is_demo=False).delete()
    logger.info("Creating a none-demo project....")
    Project.objects.update_or_create(setting=kwargs['instance'], is_demo=False)


@receiver(signal=post_save,
          sender=Project,
          dispatch_uid="create_train_if_not_exist")
def azure_project_train_status_handler(**kwargs):
    """
    Listen on azure_training.models.Project change.
    If a Project is created, create a Train(Training Status) as well.
    """
    logger.info("Azure Project changed.")
    logger.info("Checking...")

    if 'sender' not in kwargs or kwargs['sender'] != Project:
        logger.info("'sender' not in kwargs or kwargs['sender'] != Project")
        logger.info("nothing to do")
        return
    if 'instance' not in kwargs:
        logger.info("'instance' not in kwargs:'")
        logger.info("Nothing to do")
        return
    instance = kwargs['instance']
    if Train.objects.filter(project_id=instance.id).count() < 1:
        Train.objects.update_or_create(
            project_id=instance.id,
            defaults={
                "status": "ok",
                "log": "Status : Has not configured",
                "performance": ""
            },
        )


@receiver(signal=post_save,
          sender=Project,
          dispatch_uid="change_project_is_configured")
def azure_project_is_configured_handler(**kwargs):
    """
    For now, only one project can have is configured = True
    """
    logger.info("Azure Project changed.")
    logger.info("Checking...")

    if 'sender' not in kwargs or kwargs['sender'] != Project:
        logger.info("'sender' not in kwargs or kwargs['sender'] != Project")
        logger.info("nothing to do")
        return
    if 'instance' not in kwargs:
        logger.info("'instance' not in kwargs:'")
        logger.info("Nothing to do")
        return
    instance = kwargs['instance']
    if instance.has_configured:
        for other_project in Project.objects.exclude(id=instance.id):
            other_project.has_configured = False
            other_project.save()
