"""App utilities.
"""

import datetime
import json
import logging

from azure.cognitiveservices.vision.customvision.training.models import (
    ImageFileCreateBatch,
    ImageFileCreateEntry,
    Region,
)

from ..azure_parts.models import Part
from ..azure_projects.models import Project
from .models import Image

logger = logging.getLogger(__name__)


def upload_images_to_customvision_helper(
    project_id, part_id, batch_size: int = 10
) -> bool:
    """upload_images_to_customvision_helper.

    Helper function for uploading images to Custom Vision.
    Make sure part already upload to Custom Vision (
    customvision_id not null or blank).

    Args:
        project_id:
        part_id:
        batch_size (int): batch_size

    Returns:
        bool:
    """

    logger.info("Uploading images with part_id %s", part_id)

    has_new_images = False
    project_obj = Project.objects.get(pk=project_id)
    trainer = project_obj.setting.get_trainer_obj()
    part_obj: Part = Part.objects.get(pk=part_id)
    tag_id = part_obj.customvision_id
    images = Image.objects.filter(part_id=part_id, manual_checked=True, uploaded=False)
    logger.info("Tag id %s", tag_id)
    count = 0
    img_entries = []
    img_objs = []

    logger.info("Image length: %s", len(images))

    for index, image_obj in enumerate(images):
        logger.info("*** image %s, %s", index + 1, image_obj)
        has_new_images = True

        img_name = "img-" + datetime.datetime.utcnow().isoformat()

        regions = []
        width = image_obj.image.width
        height = image_obj.image.height
        try:
            labels = json.loads(image_obj.labels)
            if len(labels) == 0:
                continue
            for label in labels:
                label_x = label["x1"] / width
                label_y = label["y1"] / height
                label_w = (label["x2"] - label["x1"]) / width
                label_h = (label["y2"] - label["y1"]) / height
                tag_id = label["tag_id"]
                region = Region(
                    tag_id=tag_id,
                    left=label_x,
                    top=label_y,
                    width=label_w,
                    height=label_h,
                )
                regions.append(region)

            image = image_obj.image
            image.open()
            img_entry = ImageFileCreateEntry(
                name=img_name, contents=image.read(), regions=regions
            )
            img_objs.append(image_obj)
            img_entries.append(img_entry)
            count += 1
        except Exception:
            logger.exception("unexpected error")

        if len(img_entries) >= batch_size:
            logger.info("Uploading %s images", len(img_entries))
            upload_result = trainer.create_images_from_files(
                project_id=project_obj.customvision_id,
                batch=ImageFileCreateBatch(images=img_entries),
            )
            logger.info(
                "Uploading images... Is batch success: %s",
                upload_result.is_batch_successful,
            )
            img_entries = []
            for i, img_obj in enumerate(img_objs):
                img_obj.customvision_id = upload_result.images[i].image.id
                img_obj.uploaded = True
                img_obj.save()
            img_objs = []

    if len(img_entries) >= 1:
        logger.info("Uploading %s images", len(img_entries))
        upload_result = trainer.create_images_from_files(
            project_id=project_obj.customvision_id,
            batch=ImageFileCreateBatch(images=img_entries),
        )
        logger.info(
            "Uploading images... Is batch success: %s",
            upload_result.is_batch_successful,
        )
        for i, img_obj in enumerate(img_objs):
            img_obj.customvision_id = upload_result.images[i].image.id
            img_obj.remote_url = upload_result.images[i].image.original_image_uri
            img_obj.uploaded = True
            img_obj.save()
    logger.info("Uploading images... Done")
    logger.info("Has new images: %s", has_new_images)
    return has_new_images


def upload_and_sync_images(part_id):
    """upload_and_sync_images.

    Args:
        part_id:
    """
