"""App utilities.
"""

import logging

from azure.cognitiveservices.vision.customvision.training import (
    CustomVisionTrainingClient,
)
from azure.cognitiveservices.vision.customvision.training.models import (
    CustomVisionErrorException,
    Tag,
)

from ..azure_parts.models import Part
from ..azure_projects.models import Project

logger = logging.getLogger(__name__)


def upload_part_to_customvision_helper(
    project_id, part_id, tags_dict: dict = None
) -> bool:
    """upload_parts_to_customvision_helper.

    Args:
        project_id:         Django ORM project id
        part_id:            Django ORM part id
        tag_dict (dict):    Tag dict cache from Custom Vision

    Returns:
        bool: part_created
    """
    logger.info("upload/create part %s", part_id)

    part_created = False
    project_obj = Project.objects.get(pk=project_id)
    part_obj = Part.objects.get(id=part_id)

    trainer: CustomVisionTrainingClient = project_obj.setting.get_trainer_obj()
    az_tag_obj = Tag(
        name=part_obj.name,
        description=part_obj.description,
        type=part_obj.customvision_type,
    )

    if part_obj.customvision_id != "":
        # Probably uploaded. Sync
        logger.info(
            "updating tag: %s. Description: %s", part_obj.name, part_obj.description
        )
        tag = trainer.update_tag(
            project_id=project_obj.customvision_id,
            tag_id=part_obj.customvision_id,
            updated_tag=az_tag_obj,
        )

    else:
        # Create
        try:
            logger.info(
                "creating tag: %s. Description: %s", part_obj.name, part_obj.description
            )
            tag = trainer.create_tag(
                project_id=project_obj.customvision_id, **az_tag_obj.as_dict()
            )
            part_obj.customvision_id = tag.id
            logger.info(
                "creating tag: %s. Description: %s. Get tag.id %s",
                part_obj.name,
                part_obj.description,
                tag.id,
            )
            part_obj.save()
            part_created = True
        except CustomVisionErrorException as customvision_err:
            if customvision_err.message.find("Name not unique") == 0:
                # Part name exist in Custom Vision project.
                # But local part does not have customvision_id stored...
                if tags_dict is None:
                    tags_dict = {
                        tag.name: tag.id
                        for tag in trainer.get_tags(
                            project_id=project_obj.customvision_id
                        )
                    }
                customvision_tag_id = tags_dict[part_obj.name]
                trainer.update_tag(
                    project_id=project_obj.customvision_id,
                    tag_id=customvision_tag_id,
                    updated_tag=az_tag_obj,
                )
                part_obj.customvision_id = customvision_tag_id
                part_obj.save()
            else:
                raise customvision_err
    return part_created


def batch_upload_parts_to_customvision(project_id, part_ids, tags_dict: dict = None):
    """upload_parts_to_customvision_helper.

    Args:
        project_id:         Django ORM project id
        part_ids:           Django ORM part id
        tags_dict (dict):   tags_dict. caching.
    """

    logger.info("Creating/Update tags...")
    has_new_parts = False
    project_obj = Project.objects.get(pk=project_id)
    trainer: CustomVisionTrainingClient = project_obj.setting.get_trainer_obj()
    # init tags_dict to save time
    if tags_dict is None:
        tags_dict = {
            tag.name: tag.id
            for tag in trainer.get_tags(project_id=project_obj.customvision_project_id)
        }

    for i, part_id in enumerate(part_ids):
        logger.info("*** create/update tag count: %s, tag_id: %s", i, part_id)
        part_created = upload_part_to_customvision_helper(
            project_id=project_id, part_id=part_id, tags_dict=tags_dict
        )
        if part_created:
            has_new_parts = True
    logger.info("Creating/Update tags... Done")
    return has_new_parts
