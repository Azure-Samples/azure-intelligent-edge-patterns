"""
Signals
"""

import logging

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from ..azure_training.models import Project
from .models import Image

logger = logging.getLogger(__name__)


@receiver(signal=pre_save,
          sender=Project,
          dispatch_uid="relabel_setting_change_handler")
def relabel_setting_change_handler(**kwargs):
    """relabel_setting_change_handler.

    Listen on project relabel setting change.
    If the relabel range change, delete all relabel images

    Args:
        kwargs:
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
    if len(Project.objects.filter(pk=instance.id)) <= 0:
        logger.info("Probably creating a new setting")
        logger.info("Nothing to do")
        return
    old_project = Project.objects.get(pk=instance.id)
    if old_project.accuracyRangeMin == instance.accuracyRangeMin and \
            old_project.accuracyRangeMax == instance.accuracyRangeMax:
        logger.info(
            "Project accuracyRangeMin and accuracyRangeMax not changed")
        logger.info("Nothing to do")
        return

    logger.info("Project accuracyRangeMin and accuracyRangeMax changed...")
    logger.info("Deleting all relabel project....")
    Image.objects.filter(project=kwargs['instance'], is_relabel=True).delete()
