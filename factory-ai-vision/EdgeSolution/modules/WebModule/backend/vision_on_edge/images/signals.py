"""App signals.
"""

import logging

from django.db.models.signals import post_save, pre_delete, pre_save
from django.dispatch import receiver

from ..azure_part_detections.models import PartDetection
from ..azure_projects.models import Project
from .models import Image

logger = logging.getLogger(__name__)


@receiver(
    signal=pre_save, sender=Project, dispatch_uid="delete_images_on_project_change"
)
def azure_project_change_handler(**kwargs):
    """azure_project_change_handler."""

    logger.info("Image azure_project_change_handler")
    instance = kwargs["instance"]
    if not Project.objects.filter(pk=instance.id).exists():
        return
    old_project = Project.objects.get(pk=instance.id)
    if old_project.customvision_id == instance.customvision_id:
        logger.info("Project customvision_id not changed. Pass")
        return
    if old_project.customvision_id == "":
        logger.info("Project just created on Custom Vision. Pass")
        return
    instance.customvision_project_id_changed = True
    logger.info("Project customvision_id changed...")
    logger.info("Deleting all images....")


@receiver(
    signal=post_save, sender=Project, dispatch_uid="delete_images_on_project_change"
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
        logger.info("Project customvision_id not changed. Pass")
        return
    logger.info("Project customvision_id changed...")
    logger.info("Deleting all Images...")
    # Image.objects.filter(project=instance).delete()
    Image.objects.all().delete()


@receiver(
    signal=pre_save,
    sender=PartDetection,
    dispatch_uid="pd_relabel_setting_change_presave",
)
def pd_relabel_setting_change_presave_handler(**kwargs):
    """relabel_setting_change_handler.

    Listen on PartDetection relabel setting change.
    Set instance.delete_relabel_imgs and handle at post_save
    """
    instance = kwargs["instance"]

    if not instance.has_configured:
        return
    if not PartDetection.objects.filter(pk=instance.id).exists():
        return
    old_pd = PartDetection.objects.get(pk=instance.id)
    for attr in ["accuracyRangeMin", "accuracyRangeMax"]:
        if getattr(instance, attr) != getattr(old_pd, attr):
            instance.delete_relabel_imgs = True
    logger.info("PartDetection accuracyRange Min/Max changed...")


@receiver(
    signal=post_save,
    sender=PartDetection,
    dispatch_uid="pd_relabel_setting_change_postsave",
)
def pd_relabel_setting_change_postsave_handler(**kwargs):
    """relabel_setting_change_handler.

    if pre_save set instance.delete_relabel_imgs to True,
    delete all relabel images
    """
    instance = kwargs["instance"]
    if not instance.has_configured:
        return
    if (
        hasattr(instance, "delete_relabel_imgs")
        and instance.delete_relabel_imgs
        and instance.project is not None
    ):
        Image.objects.filter(project=instance.project, is_relabel=True).delete()


@receiver(signal=pre_delete, sender=Image, dispatch_uid="delete_img_on_customvision")
def delete_img_on_customvision(**kwargs):
    """delete_img_on_customvision.

    Args:
        kwargs:
    """
    logger.info("Deleting an image.")
    instance = kwargs["instance"]
    if (
        not instance.project
        or not instance.project.setting
        or not instance.project.setting.is_trainer_valid
        or not instance.customvision_id
    ):
        return

    # Default not to delete image on customvision
    if (
        "delete_on_customvision" not in dir(instance)
        or not instance.delete_on_customvision
    ):
        logger.info("Not specified to delete on Custom Vision. Passing")
        return

    try:
        logger.info(
            "Trying to delete %s %s on customvision",
            instance.name,
            instance.customvision_id,
        )
        trainer = instance.project.setting.get_trainer_obj()
        trainer.delete_images(
            project_id=instance.project.customvision_project_id,
            image_ids=[instance.customvision_id],
        )
        logger.info("Delete success")
    except Exception:
        logger.exception("Delete Image unexpected_error")
