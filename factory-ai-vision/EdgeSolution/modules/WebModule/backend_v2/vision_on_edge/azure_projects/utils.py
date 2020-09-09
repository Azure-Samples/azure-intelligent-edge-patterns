# -*- coding: utf-8 -*-
"""App utilities.
"""

import json
import logging
import threading
import time

from vision_on_edge.azure_app_insight.utils import get_app_insight_logger
from vision_on_edge.azure_parts.models import Part
from vision_on_edge.azure_settings.exceptions import \
    SettingCustomVisionAccessFailed
from vision_on_edge.azure_training_status.utils import upcreate_training_status
from vision_on_edge.images.models import Image

from ..azure_parts.utils import batch_upload_parts_to_customvision
from ..azure_training_status import progress
from ..images.utils import upload_images_to_customvision_helper
from .models import Project, Task

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
                project_obj.customvision_id)
            parts_now = len(trainer.get_tags(project_obj.customvision_id))
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


def pull_cv_project_helper(project_id, customvision_project_id: str,
                           is_partial: bool):
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

    # Get project objects
    project_obj = Project.objects.get(pk=project_id)

    # Check Training_Key, Endpoint
    if not project_obj.setting.is_trainer_valid:
        raise SettingCustomVisionAccessFailed

    trainer = project_obj.setting.get_trainer_obj()

    # Check Customvision Project id
    trainer.get_project(customvision_project_id)

    # Invalid CustomVision Project ID handled by exception
    project_obj.name = trainer.get_project(
        project_id=customvision_project_id).name
    project_obj.customvision_id = customvision_project_id
    project_obj.deployed = False
    project_obj.save()

    # Delete parts and images
    logger.info("Deleting all parts and images...")
    logger.info("Handle by signals...")

    # Download parts and images
    logger.info("Pulling Parts...")
    counter = 0
    tags = trainer.get_tags(customvision_project_id)
    for tag in tags:
        logger.info("Creating Part %s: %s %s", counter, tag.name,
                    tag.description)
        part_obj, created = Part.objects.update_or_create(
            project_id=project_id,
            name=tag.name,
            description=tag.description if tag.description else "",
            customvision_id=tag.id)
        logger.info("Create Part %s: %s %s Success!", counter, tag.name,
                    tag.description)
        counter += 1

        if not created:
            logger.error("%s not created", tag.name)

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
                    project_id=project_id,
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
    logger.info("Pulled %s Parts... End", counter)

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
                                               project_id=project_id)
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


def train_project_worker(project_id):
    """train_project_worker.

    Args:
        project_id:
    """
    # Get Project
    project_obj = Project.objects.get(pk=project_id)
    logger.info("Project id: %s", project_obj.id)
    if (not project_obj.setting or not project_obj.setting.is_trainer_valid):
        upcreate_training_status(project_id=project_obj.id,
                                 status="failed",
                                 log="Custom Vision Access Error")
        return
    if project_obj.is_demo:
        logger.info("Demo project is already trained")
        upcreate_training_status(project_id=project_obj.id,
                                 need_to_send_notification=True,
                                 **progress.PROGRESS_0_OK)
        return
    trainer = project_obj.setting.get_trainer_obj()
    customvision_project_id = project_obj.customvision_id
    project_obj.dequeue_iterations()

    part_ids = [part.id for part in Part.objects.filter(project=project_obj)]
    logger.info("Part ids: %s", part_ids)

    # Get/Create Project on Custom Vision
    try:
        trainer.get_project(customvision_project_id)
        upcreate_training_status(
            project_id=project_obj.id,
            status="preparing",
            log=(f"Project {project_obj.name} " + "found on Custom Vision"),
        )
    except Exception:
        project_obj.create_project()
        upcreate_training_status(project_id=project_obj.id,
                                 need_to_send_notification=True,
                                 **progress.PROGRESS_2_PROJECT_CREATED)

    project_obj = Project.objects.get(pk=project_id)
    logger.info("Project created on CustomVision.")
    logger.info("Project Id: %s", project_obj.customvision_id)
    logger.info("Project Name: %s", project_obj.name)

    upcreate_training_status(project_id=project_obj.id,
                             need_to_send_notification=True,
                             **progress.PROGRESS_3_UPLOADING_PARTS)

    # Get tags_dict to avoid getting tags every time
    tags = trainer.get_tags(project_id=project_obj.customvision_id)
    tags_dict = {tag.name: tag.id for tag in tags}

    # App Insight
    project_changed = False
    has_new_parts = False
    has_new_images = False
    parts_last_train = len(tags)
    images_last_train = trainer.get_tagged_image_count(
        project_obj.customvision_id)

    # Create/update tags on CustomVisioin Project
    has_new_parts = batch_upload_parts_to_customvision(project_id=project_id,
                                                       part_ids=part_ids,
                                                       tags_dict=tags_dict)
    if has_new_parts:
        project_changed = True

    upcreate_training_status(project_id=project_obj.id,
                             need_to_send_notification=True,
                             **progress.PROGRESS_4_UPLOADING_IMAGES)

    # Upload images to CustomVisioin Project
    for part_id in part_ids:
        logger.info("Uploading images with part_id %s", part_id)
        has_new_images = upload_images_to_customvision_helper(
            project_id=project_obj.id, part_id=part_id)
        if has_new_images:
            project_changed = True

    # Submit training task to Custom Vision
    if not project_changed:
        logger.info("Project not changed. Not Training!")
        upcreate_training_status(project_id=project_obj.id,
                                 need_to_send_notification=True,
                                 **progress.PROGRESS_0_OK)
    else:
        upcreate_training_status(
            project_id=project_obj.id,
            need_to_send_notification=True,
            **progress.PROGRESS_5_SUBMITTING_TRAINING_TASK)
        training_task_submit_success = project_obj.train_project()
        if training_task_submit_success:
            update_app_insight_counter(
                project_obj=project_obj,
                has_new_parts=has_new_parts,
                has_new_images=has_new_images,
                parts_last_train=parts_last_train,
                images_last_train=images_last_train,
            )
        update_train_status_worker(project_id=project_obj.id)


def update_train_status_worker(project_id):
    """update_train_status_worker.

    Args:
        project_id:
    """
    project_obj = Project.objects.get(pk=project_id)
    setting_obj = project_obj.setting
    if setting_obj is None or not setting_obj.is_trainer_valid:
        upcreate_training_status(
            project_id=project_obj.id,
            status="failed",
            log="Invalid setting (training key or endpoint error).",
            need_to_send_notification=True,
        )
        return

    project_found = False
    if not project_found and not project_obj.validate():
        upcreate_training_status(
            project_id=project_obj.id,
            status="failed",
            log="Invalid project customvision_id.",
            need_to_send_notification=True,
        )
        return
    project_found = True

    trainer = setting_obj.get_trainer_obj()
    customvision_id = project_obj.customvision_id
    wait_prepare = 0
    # If exceed, this project probably not going to be trained
    max_wait_prepare = 60

    # Send notification only when init
    training_init = False
    export_init = False

    while True:
        time.sleep(1)

        iterations = trainer.get_iterations(customvision_id)
        if len(iterations) == 0:
            upcreate_training_status(
                project_id=project_obj.id,
                **progress.PROGRESS_6_PREPARING_CUSTOM_VISION_ENV)
            wait_prepare += 1
            if wait_prepare > max_wait_prepare:
                logger.info("Something went wrong...")
                upcreate_training_status(
                    project_id=project_obj.id,
                    status="failed",
                    log="Get iteration from Custom Vision occurs error.",
                    need_to_send_notification=True,
                )
                break
            continue

        iteration = iterations[0]
        if not iteration.exportable or iteration.status != "Completed":
            upcreate_training_status(
                project_id=project_obj.id,
                need_to_send_notification=(not training_init),
                **progress.PROGRESS_7_TRAINING)
            training_init = True
            continue

        exports = trainer.get_exports(customvision_id, iteration.id)
        if len(exports) == 0 or not exports[0].download_uri:
            upcreate_training_status(
                project_id=project_obj.id,
                need_to_send_notification=(not export_init),
                **progress.PROGRESS_8_EXPORTING)
            export_init = True
            res = project_obj.export_iterationv3_2(iteration.id)
            logger.info("Export Response: %s", res.json())
            continue

        project_obj.download_uri = exports[0].download_uri
        project_obj.save(update_fields=["download_uri"])

        logger.info("Successfully export model: %s", project_obj.download_uri)

        logger.info("Training Status: Completed")
        train_performance_list = []
        for iteration in iterations[:2]:
            train_performance_list.append(
                trainer.get_iteration_performance(customvision_id,
                                                  iteration.id).as_dict())

            logger.info("Training Performance: %s", train_performance_list)
        upcreate_training_status(
            project_id=project_obj.id,
            performance=json.dumps(train_performance_list),
            need_to_send_notification=True,
            **progress.PROGRESS_0_OK)
        project_obj.save()
        break


def train_project_helper(project_id):
    """train_project_helper.

    Open a thread to upload the items.

    Args:
        project_id: Django ORM project id.
    """
    threading.Thread(target=train_project_worker, args=(project_id,)).start()


def update_train_status_helper(project_id):
    """update_train_status.

    Open a thread to update the training status object.

    Args:
        project_id: Django ORM project id
    """
    threading.Thread(target=update_train_status_worker,
                     args=(project_id,)).start()
