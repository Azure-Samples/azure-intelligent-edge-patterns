# -*- coding: utf-8 -*-
"""App utilities.
"""

import datetime
import logging

import json
from vision_on_edge.azure_parts.models import Part
from .models import Image
from azure.cognitiveservices.vision.customvision.training.models import (
    ImageFileCreateEntry, Region)

logger = logging.getLogger(__name__)


def customvision_upload_images_helper(part_id):
    """customvision_upload_images_helper.

    Args:
        part_id:

    Return:
        has_new_images
    """
    has_new_images = False
    images = Image.objects.filter(part_id=part_id,
                                  is_relabel=False,
                                  uploaded=False).all()
    logger.info("Uploading images...")
    count = 0
    img_entries = []
    img_objs = []
    logger.info("Image length: %s", len(images))

    for index, image_obj in enumerate(images):
        logger.info("*** image %s, %s", index + 1, image_obj)
        has_new_images = True
        part: Part = image_obj.part
        part_name = part.name
        tag_id = part.customvision_id
        img_name = "img-" + datetime.datetime.utcnow().isoformat()

        regions = []
        width = image_obj.image.width
        height = image_obj.image.height
        try:
            labels = json.loads(image_obj.labels)
            if len(labels) == 0:
                continue
            for label in labels:
                x = label["x1"] / width
                y = label["y1"] / height
                w = (label["x2"] - label["x1"]) / width
                h = (label["y2"] - label["y1"]) / height
                region = Region(tag_id=tag_id,
                                left=x,
                                top=y,
                                width=w,
                                height=h)
                regions.append(region)

            image = image_obj.image
            image.open()
            img_entry = ImageFileCreateEntry(name=img_name,
                                             contents=image.read(),
                                             regions=regions)
            img_objs.append(image_obj)
            img_entries.append(img_entry)
            project_changed = project_changed or (not image_obj.uploaded)
            if project_changed:
                logger.info("project_changed: %s", project_changed)
            count += 1
        except:
            logger.exception("unexpected error")

        if len(img_entries) >= 5:
            logger.info("Uploading %s images", len(img_entries))
            upload_result = trainer.create_images_from_files(
                customvision_project_id, images=img_entries)
            logger.info(
                "Uploading images... Is batch success: %s",
                upload_result.is_batch_successful,
            )
            img_entries = []
            for img_obj in img_objs:
                img_obj.uploaded = True
                img_obj.save()
            img_objs = []

    if len(img_entries) >= 1:
        logger.info("Uploading %s images", len(img_entries))
        upload_result = trainer.create_images_from_files(
            customvision_project_id, images=img_entries)
        logger.info(
            "Uploading images... Is batch success: %s",
            upload_result.is_batch_successful,
        )
        for img_obj in img_objs:
            img_obj.uploaded = True
            img_obj.save()
    logger.info("Uploading images... Done")
    return has_new_images
