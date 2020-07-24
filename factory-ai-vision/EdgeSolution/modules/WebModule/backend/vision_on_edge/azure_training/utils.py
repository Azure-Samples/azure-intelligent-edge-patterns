"""
Project Utilities
"""

import logging

from .models import Project, Task, Train
from vision_on_edge.azure_parts.models import Part
from vision_on_edge.images.models import Image
from vision_on_edge.azure_app_insight.utils import get_app_insight_logger
from django.http import JsonResponse
from vision_on_edge.general import error_messages

from azure.cognitiveservices.vision.customvision.training.models import (
    CustomVisionErrorException, ImageFileCreateEntry, Region)

logger = logging.getLogger(__name__)


def update_app_insight_counter(
        project_obj,
        has_new_parts: bool,
        has_new_images: bool,
        parts_last_train: int,
        images_last_train: int,
):
    """Send message to app insight"""
    try:
        retrain = train = 0
        if has_new_parts:
            logger.info("This is a training job")
            project_obj.training_counter += 1
            project_obj.save(update_fields=["training_counter"])
            train = 1
        elif has_new_images:
            logger.info("This is a re-training job")
            project_obj.retraining_counter += 1
            project_obj.save(update_fields=["retraining_counter"])
            retrain = 1
        else:
            logger.info("Project not changed")
        logger.info("Sending Data to App Insight %s",
                    project_obj.setting.is_collect_data)
        if project_obj.setting.is_collect_data:
            logger.info("Sending Logs to App Insight")
            trainer = project_obj.setting.get_trainer_obj()
            images_now = trainer.get_tagged_image_count(
                project_obj.customvision_project_id)
            parts_now = len(
                trainer.get_tags(project_obj.customvision_project_id))
            # Traces
            az_logger = get_app_insight_logger()
            az_logger.warning(
                "training",
                extra={
                    "custom_dimensions": {
                        "train": train,
                        "images": images_now - images_last_train,
                        "parts": parts_now - parts_last_train,
                        "retrain": retrain,
                    }
                },
            )
    except:
        logger.exception("update_app_insight_counter occur unexcepted error")
        raise


def pull_cv_project_helper(project_id, customvision_project_id: str, is_partial: bool):
    """pull_cv_project_helper.

    Args:
        project_id:
        customvision_project_id (str): customvision_project_id
        is_partial (bool): is_partial
    """

    logger.info("pull_cv_project_helper")
    logger.info("project_id %s", project_id)
    logger.info("customvision_project_id: %s", customvision_project_id)
    logger.info("is_partial %s", is_partial)

    # Get project
    # FIXME: Should send correct id
    try:
        project_obj = Project.objects.get(pk=project_id)
    except:
        # Guessing...
        project_obj = Project.objects.get(is_demo=False)

    # Check Project
    if project_obj.is_demo:
        raise AttributeError("Demo project should not change")

    # Check Training_Key, Endpoint
    if not project_obj.setting.is_trainer_valid:
        raise AttributeError(error_messages.CUSTOM_VISION_ACCESS_ERROR)

    trainer = project_obj.setting.get_trainer_obj()

    # Check Customvision Project id
    trainer.get_project(customvision_project_id)

    # Invalid CustomVision Project ID handled by exception
    project_obj.customvision_project_name = trainer.get_project(
        project_id=customvision_project_id).name
    project_obj.customvision_project_id = customvision_project_id
    project_obj.deployed = False
    project_obj.save()

    # Delete parts and images
    logger.info("Deleting all parts and images...")
    for part in Part.objects.filter(is_demo=False):
        part.delete_on_customvision = False
        part.delete()
    for img in Image.objects.all():
        img.delete_on_customvision = False
        img.delete()

    # Download parts and images
    logger.info("Pulling Parts...")
    counter = 0
    tags = trainer.get_tags(customvision_project_id)
    for tag in tags:
        logger.info("Creating Part %s: %s %s", counter, tag.name,
                    tag.description)
        part_obj, created = Part.objects.update_or_create(
            name=tag.name,
            description=tag.description if tag.description else "",
            customvision_id=tag.id)
        counter += 1

        if created:
            project_obj.parts.add(part_obj)
        else:
            logging.error("%s not added", tag.name)

        if is_partial:
            logger.info("loading one image as icon")
            try:
                img = trainer.get_tagged_images(
                    project_id=customvision_project_id,
                    tag_ids=[tag.id],
                    take=1)[0]
                image_uri = img.original_image_uri
                img_obj, created = Image.objects.update_or_create(
                    part=part_obj,
                    remote_url=image_uri,
                    customvision_id=img.id,
                    project=project_obj,
                    uploaded=True)
                logger.info("loading from remote url: %s", img_obj.remote_url)
                img_obj.get_remote_image()
                logger.info("Finding tag.id %s", tag.id)
                logger.info("Finding tag.name %s", tag.name)
                for region in img.regions:
                    if region.tag_id == tag.id:
                        logger.info("Region Found")
                        img_obj.set_labels(
                            left=region.left,
                            top=region.top,
                            width=region.width,
                            height=region.height,
                        )
                        break

            except Exception:
                logger.info("Tag %s have no images on Custom Vision", tag.name)
    logger.info("Pulled %s Parts", counter)
    logger.info("Pulling Parts... End")

    # Partial Download
    if is_partial:
        exporting_task_obj = Task.objects.create(
            task_type="export_iteration",
            status="init",
            log="Just Started",
            project=project_obj,
        )
        exporting_task_obj.start_exporting()
        return

    # Full Download
    logger.info("Pulling Tagged Images...")
    img_counter = 0
    imgs_count = trainer.get_tagged_image_count(
        project_id=customvision_project_id)
    img_batch_size = 50
    img_index = 0

    while img_index <= imgs_count:
        logger.info("Img Index: %s. Img Count: %s", img_index, imgs_count)
        imgs = trainer.get_tagged_images(project_id=customvision_project_id,
                                         take=img_batch_size,
                                         skip=img_index)
        for img in imgs:
            logger.info("*** img %s", img_counter)
            for region in img.regions:
                part_obj = Part.objects.filter(name=region.tag_name,
                                               is_demo=False)[0]
                img_obj, created = Image.objects.update_or_create(
                    part=part_obj,
                    remote_url=img.original_image_uri,
                    project=project_obj,
                    customvision_id=img.id)
                if created:
                    logger.info("Downloading img %s", img.id)
                    img_obj.get_remote_image()
                    logger.info("Setting label of %s", img.id)
                    img_obj.set_labels(
                        left=region.left,
                        top=region.top,
                        width=region.width,
                        height=region.height,
                    )
                    img_counter += 1
                else:
                    # TODO:  Multiple region with same tag
                    logger.info("Adding label to %s", img.id)
                    img_obj.add_labels(
                        left=region.left,
                        top=region.top,
                        width=region.width,
                        height=region.height,
                    )

        img_index += img_batch_size
    logger.info("Pulled %s images", counter)
    logger.info("Pulling Tagged Images... End")
    logger.info("Pulling CustomVision Project... End")
