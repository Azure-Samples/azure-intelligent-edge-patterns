"""App Signals"""

import logging

from django.db.models.signals import pre_delete, pre_save
from django.dispatch import receiver

from ..azure_settings.models import Setting
from ..azure_training.models import Project
from .models import Part

logger = logging.getLogger(__name__)


@receiver(signal=pre_save,
          sender=Setting,
          dispatch_uid="delete_part_on_setting_change")
def azure_setting_change_handler(**kwargs):
    """azure_setting_change_handler.

    If setting changed, remove all part.

    Args:
        kwargs:
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
    logger.info("Deleting all none-demo part....")
    Part.objects.filter(is_demo=False).delete()


@receiver(signal=pre_delete,
          sender=Part,
          dispatch_uid="delete_part_on_customvision")
def delete_part_on_customvision_handler(**kwargs):
    """delete_part_on_customvision_handler.

    If part delete with customvision_id, delete on Custom Vision.

    Args:
        kwargs:
    """

    logger.info("Part is deleting")
    logger.info("Checking...")

    if 'sender' not in kwargs or kwargs['sender'] != Part:
        logger.info("'sender' not in kwargs or kwargs['sender'] != setting")
        logger.info("nothing to do")
        return
    if 'instance' not in kwargs:
        logger.info("'instance' not in kwargs:'")
        logger.info("Nothing to do")
        return
    instance = kwargs['instance']
    if not instance.customvision_id:
        logger.info("Part have no customvision_id. Skip")

    # FIXME: Use Part foreign key project if availible
    if not Project.objects.filter(is_demo=False).count() == 1:
        logger.error("Have customvision_id but can not guess the project...")
        return

    # Default delete tag on customvision
    if 'delete_on_customvision' not in dir(
            instance) or not instance.delete_on_customvision:
        return

    try:
        logger.info("Trying to delete %s %s on customvision", instance.name,
                    instance.customvision_id)
        project_obj = Project.objects.get(is_demo=False)
        trainer = project_obj.setting.get_trainer_obj()
        trainer.delete_tag(project_id=project_obj.customvision_project_id,
                           tag_id=instance.customvision_id)
        logger.info("Delete success")
    except Exception:
        logger.exception("delete_tag unexpected_error")
