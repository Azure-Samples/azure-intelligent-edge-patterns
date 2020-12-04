"""App signals.
"""

import logging

from django.db.models.signals import post_save, pre_delete, pre_save
from django.dispatch import receiver

from ..azure_projects.models import Project
from .models import Part

logger = logging.getLogger(__name__)


@receiver(signal=pre_save, sender=Project, dispatch_uid="delete_part_on_project_change")
def azure_project_change_handler(**kwargs):
    """azure_project_change_handler.

    If project changed, remove all part.

    Args:
        kwargs:
    """
    logger.info("Part azure_project_change_handler")
    instance = kwargs["instance"]
    if not Project.objects.filter(pk=instance.id).exists():
        return
    old_project = Project.objects.get(pk=instance.id)
    if old_project.customvision_id == instance.customvision_id:
        logger.info("Custom Vision Project Id not changed... Pass")
        return
    if old_project.customvision_id == "":
        logger.info("Project just created on Custom Vision. Pass")
        return
    instance.customvision_project_id_changed = True
    logger.info("Project customvision_project_id changed...")
    logger.info("Deleting all parts....")


@receiver(
    signal=post_save, sender=Project, dispatch_uid="delete_part_on_project_change"
)
def azure_project_post_save_handler(**kwargs):
    """azure_project_post_save_handler."""

    if kwargs["created"]:
        logger.info("Project just created. Pass")
        return
    instance = kwargs["instance"]
    if (
        not hasattr(instance, "customvision_project_id_changed")
        or not instance.customvision_project_id_changed
    ):
        logger.info("Custom Vision project id not changed. Pass")
        return
    logger.info("Project customvision_project_id changed...")
    logger.info("Deleting all Parts...")
    Part.objects.filter(project=instance).delete()


@receiver(signal=pre_delete, sender=Part, dispatch_uid="delete_part_on_customvision")
def delete_part_on_customvision_handler(**kwargs):
    """delete_part_on_customvision_handler.

    If part delete with customvision_id, delete on Custom Vision.

    Args:
        kwargs:
    """
    logger.info("Deleting a part.")

    # Dummy Check
    instance = kwargs["instance"]
    if not instance.customvision_id:
        logger.info("Part have no customvision_id. Skip")

    if (
        instance.project is None
        or instance.project.setting is None
        or not instance.project.setting.is_trainer_valid
    ):
        logger.error("Have customvision_id but no valid project with key")
        return

    # Default not to delete tag on customvision
    if (
        "delete_on_customvision" not in dir(instance)
        or not instance.delete_on_customvision
    ):
        logger.info("Not specified to delete on Custom Vision. Passing")
        return

    try:
        logger.info(
            "Delete tag (%s, %s) on Custom Vision.",
            instance.name,
            instance.customvision_id,
        )
        trainer = instance.project.setting.get_trainer_obj()
        trainer.delete_tag(
            project_id=instance.project.customvision_id, tag_id=instance.customvision_id
        )
        logger.info("Delete success.")
    except Exception:
        logger.exception("Delete failed.")
