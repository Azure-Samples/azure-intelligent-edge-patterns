"""
Signals
"""

import logging

from django.db.models.signals import post_save, pre_delete, pre_save
from django.dispatch import receiver

from ..azure_training.models import Project
from .models import Image

logger = logging.getLogger(__name__)


@receiver(signal=pre_save,
          sender=Project,
          dispatch_uid="relabel_setting_change_handler")
def relabel_setting_change_handler_pre(**kwargs):
    """relabel_setting_change_handler.

    Listen on project relabel setting change.
    If the relabel range change, delete all relabel images.

    We have to delete images at post_save. However, it is
    impossible to check if range is change at post_save.

    Thus. We need to add an instance attribute for post_save
    to check

    Args:
        kwargs:
    """
    if 'sender' not in kwargs or kwargs['sender'] != Project:
        logger.info("'sender' not in kwargs or kwargs['sender'] != Project")
        logger.info("nothing to do")
        return
    if 'instance' not in kwargs:
        logger.info("'instance' not in kwargs:'")
        logger.info("Nothing to do")
        return
    instance = kwargs['instance']

    if not instance.has_configured:
        return
    if not Project.objects.filter(id=instance.id).exists():
        return
    old_project = Project.objects.get(id=instance.id)
    for attr in ['accuracyRangeMin', 'accuracyRangeMax']:
        if getattr(instance, attr) != getattr(old_project, attr):
            instance.delete_relabel_imgs = True
            logger.info(
                "Project accuracyRangeMin and accuracyRangeMax changed...")
            logger.info("Will deleting all relabel images at post_save")
            break


@receiver(signal=post_save,
          sender=Project,
          dispatch_uid="relabel_setting_change_handler")
def relabel_setting_change_handler(**kwargs):
    """relabel_setting_change_handler.

    Listen on project relabel setting change.
    If the relabel range change, delete all relabel images

    Args:
        kwargs:
    """

    if 'sender' not in kwargs or kwargs['sender'] != Project:
        logger.info("'sender' not in kwargs or kwargs['sender'] != Project")
        logger.info("nothing to do")
        return
    if 'instance' not in kwargs:
        logger.info("'instance' not in kwargs:'")
        logger.info("Nothing to do")
        return
    instance = kwargs['instance']

    if not instance.has_configured:
        return
    if hasattr(instance, 'delete_relabel_imgs') and \
            instance.delete_relabel_imgs:
        Image.objects.filter(project=instance, is_relabel=True).delete()
        logger.info("Deleting all relabel images... complete")


@receiver(signal=pre_delete,
          sender=Image,
          dispatch_uid="delete_img_on_customvision")
def delete_img_on_customvision(**kwargs):
    """delete_img_on_customvision.

    Args:
        kwargs:
    """

    if 'sender' not in kwargs or kwargs['sender'] is not Image:
        return
    if 'instance' not in kwargs:
        return
    instance = kwargs['instance']
    if not instance.project or \
            not instance.project.setting or \
            not instance.project.setting.is_trainer_valid or \
            not instance.customvision_id:
        return

    if 'delete_on_customvision' in dir(
            instance) and not instance.delete_on_customvision:
        logger.info("Someone specify not to delete on Custom Vision")
        return

    try:
        trainer = instance.project.setting.get_trainer_obj()
        trainer.delete_images(
            project_id=instance.project.customvision_project_id,
            image_ids=[instance.customvision_id])
    except Exception:
        logger.exception("delete_tag unexpected_error")
