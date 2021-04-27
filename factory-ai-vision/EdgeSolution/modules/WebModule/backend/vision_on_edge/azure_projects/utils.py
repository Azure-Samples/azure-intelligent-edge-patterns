"""App utilities.
"""

import json
import logging
import sys
import threading
import time
import traceback

from configs.general_configs import PRINT_THREAD

from ..azure_app_insight.utils import get_app_insight_logger
from ..azure_parts.models import Part
from ..azure_parts.utils import batch_upload_parts_to_customvision
from ..azure_settings.exceptions import SettingCustomVisionAccessFailed
from ..azure_training_status import progress
from ..azure_training_status.utils import upcreate_training_status
from ..images.models import Image
from ..images.utils import upload_images_to_customvision_helper
from .exceptions import ProjectAlreadyTraining, ProjectRemovedError
from .models import Project, Task

logger = logging.getLogger(__name__)


def update_app_insight_counter(
    project_obj,
    has_new_parts: bool,
    has_new_images: bool,
    parts_last_train: int,
    images_last_train: int,
):
    """Send message to app insight."""
    try:
        retrain = train = 0
        if has_new_parts:
            logger.info("This is a training job")
            train = 1
        elif has_new_images:
            logger.info("This is a re-training job")
            retrain = 1
        else:
            logger.info("Project not changed")
        logger.info(
            "Sending Data to App Insight %s", project_obj.setting.is_collect_data
        )
        if project_obj.setting.is_collect_data:
            logger.info("Sending Logs to App Insight")
            trainer = project_obj.setting.get_trainer_obj()
            images_now = trainer.get_tagged_image_count(project_obj.customvision_id)
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
    except Exception:
        logger.exception("update_app_insight_counter occur unexcepted error")
        raise


def pull_cv_project_helper(project_id, customvision_project_id: str, is_partial: bool):
    """pull_cv_project_helper.

    Args:
        project_id:                     Django ORM project id
        customvision_project_id (str):  customvision_project_id
        is_partial (bool):              is_partial
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
    try:
        trainer.get_project(customvision_project_id)
    except Exception:
        raise ProjectRemovedError

    # Invalid CustomVision Project ID handled by exception
    project_obj.name = trainer.get_project(project_id=customvision_project_id).name
    project_obj.customvision_id = customvision_project_id
    project_obj.save()

    # Delete parts and images
    logger.info("Deleting all parts and images...")
    logger.info("Handle by signals...")

    # Download parts and images
    logger.info("Pulling Parts...")
    counter = 0
    tags = trainer.get_tags(customvision_project_id)
    for tag in tags:
        logger.info("Creating Part %s: %s %s", counter, tag.name, tag.description)
        part_obj, created = Part.objects.update_or_create(
            project_id=project_id,
            name=tag.name,
            description=tag.description if tag.description else "",
            customvision_id=tag.id,
        )

        # Make sure part is created
        if not created:
            logger.exception("%s not created", tag.name)
            continue
        logger.info(
            "Create Part %s: %s %s Success!", counter, tag.name, tag.description
        )
        counter += 1

        # Download one image as icon
        if is_partial:
            logger.info("Try to download one image as icon.")

            # Image file
            imgs_with_tag = trainer.get_tagged_images(
                project_id=customvision_project_id, tag_ids=[tag.id], take=1
            )
            if len(imgs_with_tag) < 1:
                logger.info("This tag does not have an image")
                continue
            img = imgs_with_tag[0]
            img_obj, created = Image.objects.update_or_create(
                part=part_obj,
                remote_url=img.original_image_uri,
                customvision_id=img.id,
                project_id=project_id,
                uploaded=True,
                manual_checked=True,
            )
            try:
                img_obj.get_remote_image()
            except Exception:
                logger.exception("Download remote image occur exception.")
                logger.exception("Image discarded...")
                img_obj.delete()
                continue

            # Image Labels
            logger.info("Finding region with tag (%s, %s)", tag.name, tag.id)
            for region in img.regions:
                if region.tag_id == tag.id:
                    logger.info("Region Found")
                    img_obj.set_labels(
                        left=region.left,
                        top=region.top,
                        width=region.width,
                        height=region.height,
                        tag_id=tag.id,
                    )
                    break

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
    imgs_count = trainer.get_tagged_image_count(project_id=customvision_project_id)
    img_batch_size = 50
    img_index = 0

    while img_index <= imgs_count:
        logger.info("Img Index: %s. Img Count: %s", img_index, imgs_count)
        imgs = trainer.get_tagged_images(
            project_id=customvision_project_id, take=img_batch_size, skip=img_index
        )
        for img in imgs:
            logger.info("*** img %s", img_counter)
            for region in img.regions:
                part_objs = Part.objects.filter(
                    name=region.tag_name, project_id=project_id
                )
                if not part_objs.exists():
                    continue
                part_obj = part_objs.first()
                img_obj, created = Image.objects.update_or_create(
                    part=part_obj,
                    remote_url=img.original_image_uri,
                    project=project_obj,
                    customvision_id=img.id,
                    manual_checked=True,
                )
                if created:
                    logger.info("Downloading img %s", img.id)
                    img_obj.get_remote_image()
                    logger.info("Setting label of %s", img.id)
                    img_obj.set_labels(
                        left=region.left,
                        top=region.top,
                        width=region.width,
                        height=region.height,
                        tag_id=part_obj.customvision_id
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
    logger.info("Pulling Custom Vision Project... End")


def train_project_worker(project_id):
    """train_project_worker.

    Args:
        project_id: Django ORM project id
    """
    # =====================================================
    # 0. Bypass project that need no traing             ===
    # =====================================================
    project_obj = Project.objects.get(pk=project_id)
    logger.info("Project id: %s", project_obj.id)
    if project_obj.is_demo:
        logger.info("Demo project is already trained")
        upcreate_training_status(
            project_id=project_obj.id,
            need_to_send_notification=True,
            **progress.PROGRESS_0_OK,
        )
        return
    if project_obj.is_prediction_module:
        logger.info("Prediction Module need no train.")
        upcreate_training_status(
            project_id=project_obj.id,
            need_to_send_notification=True,
            **progress.PROGRESS_0_OK,
        )
        return

    # =====================================================
    # 0. Get Project in Django                          ===
    # =====================================================
    if not project_obj.setting or not project_obj.setting.is_trainer_valid:
        upcreate_training_status(
            project_id=project_obj.id, status="failed", log="Custom Vision Access Error"
        )
        return

    # =====================================================
    # 1. Prepare Custom Vision Client                   ===
    # =====================================================
    trainer = project_obj.setting.get_trainer_obj()
    customvision_project_id = project_obj.customvision_id
    project_obj.dequeue_iterations()

    part_ids = [part.id for part in Part.objects.filter(project=project_obj)]
    logger.info("Part ids: %s", part_ids)

    # =====================================================
    # 2. Get/Create Project on Custom Vision            ===
    # =====================================================
    try:
        trainer.get_project(customvision_project_id)
        upcreate_training_status(
            project_id=project_obj.id,
            status="preparing",
            log=(f"Project {project_obj.name} " + "found on Custom Vision"),
        )
    except Exception:
        project_obj.create_project()
        upcreate_training_status(
            project_id=project_obj.id,
            need_to_send_notification=True,
            **progress.PROGRESS_2_PROJECT_CREATED,
        )

    project_obj = Project.objects.get(pk=project_id)
    logger.info("Project created on Custom Vision.")
    logger.info("Project Id: %s", project_obj.customvision_id)
    logger.info("Project Name: %s", project_obj.name)

    # =====================================================
    # 3. Upload parts                                   ===
    # =====================================================
    upcreate_training_status(
        project_id=project_obj.id,
        need_to_send_notification=True,
        **progress.PROGRESS_3_UPLOADING_PARTS,
    )

    # Get tags_dict to avoid getting tags every time
    tags = trainer.get_tags(project_id=project_obj.customvision_id)
    tags_dict = {tag.name: tag.id for tag in tags}

    # App Insight
    project_changed = False
    has_new_parts = False
    has_new_images = False
    parts_last_train = len(tags)
    images_last_train = trainer.get_tagged_image_count(project_obj.customvision_id)

    # Create/update tags on Custom Vision Project
    has_new_parts = batch_upload_parts_to_customvision(
        project_id=project_id, part_ids=part_ids, tags_dict=tags_dict
    )
    if has_new_parts:
        project_changed = True

    upcreate_training_status(
        project_id=project_obj.id,
        need_to_send_notification=True,
        **progress.PROGRESS_4_UPLOADING_IMAGES,
    )

    # =====================================================
    # 4. Upload images to Custom Vision Project         ===
    # =====================================================
    for part_id in part_ids:
        logger.info("Uploading images with part_id %s", part_id)
        has_new_images = upload_images_to_customvision_helper(
            project_id=project_obj.id, part_id=part_id
        )
        if has_new_images:
            project_changed = True

    # =====================================================
    # 5. Submit Training Task to Custom Vision          ===
    # =====================================================
    logger.info("Submit Training Task")
    if not project_changed:
        logger.info("Project not changed. Not Training!")
        upcreate_training_status(
            project_id=project_obj.id,
            need_to_send_notification=True,
            **progress.PROGRESS_0_OK,
        )
        return
    upcreate_training_status(
        project_id=project_obj.id,
        need_to_send_notification=True,
        **progress.PROGRESS_5_SUBMITTING_TRAINING_TASK,
    )
    training_task_submit_success = project_obj.train_project()
    # App Insight
    if training_task_submit_success:
        update_app_insight_counter(
            project_obj=project_obj,
            has_new_parts=has_new_parts,
            has_new_images=has_new_images,
            parts_last_train=parts_last_train,
            images_last_train=images_last_train,
        )

    # =====================================================
    # 6. Training (Finding Iteration)                   ===
    # =====================================================
    logger.info("Finding Iteration")
    customvision_id = project_obj.customvision_id
    wait_prepare = 0
    max_wait_prepare = 60
    status_init = False
    while True:
        time.sleep(1)
        wait_prepare += 1
        iterations = trainer.get_iterations(customvision_id)
        if not status_init:
            upcreate_training_status(
                project_id=project_obj.id,
                need_to_send_notification=True,
                **progress.PROGRESS_6_PREPARING_CUSTOM_VISION_ENV,
            )
            status_init = True
        if len(iterations) > 0:
            logger.info("Iteration Found %s", iterations[0])
            break
        if wait_prepare > max_wait_prepare:
            logger.info("Something went wrong...")
            upcreate_training_status(
                project_id=project_obj.id,
                status="failed",
                log="Get iteration from Custom Vision occurs error.",
                need_to_send_notification=True,
            )
            break

    # =====================================================
    # 6. Training (Waiting)                             ===
    # =====================================================
    logger.info("Training")
    status_init = False
    while True:
        time.sleep(1)
        iterations = trainer.get_iterations(customvision_id)
        iteration = iterations[0]
        if not status_init:
            upcreate_training_status(
                project_id=project_obj.id,
                need_to_send_notification=True,
                **progress.PROGRESS_7_TRAINING,
            )
            status_init = True
        if iteration.exportable and iteration.status == "Completed":
            break
        logger.info("Still training...")

    # =====================================================
    # 7. Exporting                                      ===
    # =====================================================
    status_init = False
    while True:
        time.sleep(1)
        if not status_init:
            upcreate_training_status(
                project_id=project_obj.id,
                need_to_send_notification=True,
                **progress.PROGRESS_8_EXPORTING,
            )
            status_init = True
        try:
            project_obj.export_iteration(iteration.id)
        except Exception:
            logger.exception("Export already in queue")
        try:
            project_obj.export_iteration(iteration.id, flavor="ONNXFloat16")
        except Exception:
            logger.exception("Export already in queue")
        try:
            exports = project_obj.get_exports(iteration.id)
        except Exception:
            logger.exception("get_exports exception")
            continue
        if (
            len(exports) < 2
            or not exports[0].download_uri
            or not exports[1].download_uri
        ):
            logger.info("Status: exporting model")
            continue
        break

    # =====================================================
    # 8. Saving model and performance                   ===
    # =====================================================
    logger.info("Successfully export model: %s", project_obj.download_uri)
    logger.info("Training about to completed.")

    exports = trainer.get_exports(customvision_id, iteration.id)
    if not exports[0].flavor:
        project_obj.download_uri = exports[0].download_uri
        project_obj.download_uri_fp16 = exports[1].download_uri
    else:
        project_obj.download_uri = exports[1].download_uri
        project_obj.download_uri_fp16 = exports[0].download_uri

    train_performance_list = []

    for iteration in iterations[:2]:
        train_performance_list.append(
            trainer.get_iteration_performance(customvision_id, iteration.id).as_dict()
        )

    upcreate_training_status(
        project_id=project_obj.id,
        performance=json.dumps(train_performance_list),
        need_to_send_notification=True,
        **progress.PROGRESS_0_OK,
    )
    logger.info("Training Performance: %s", train_performance_list)

    # =====================================================
    # 0. End                                            ===
    # =====================================================
    if has_new_parts:
        logger.info("This is a training job")
        project_obj.training_counter += 1
    elif has_new_images:
        logger.info("This is a re-training job")
        project_obj.retraining_counter += 1
    project_obj.save()


def train_project_catcher(project_id):
    """train_project_catcher.

    Dummy exception handler.

    Args:
        project_id:
    """
    try:
        train_project_worker(project_id=project_id)
    except Exception:
        upcreate_training_status(
            project_id=project_id,
            status="failed",
            log=traceback.format_exc(),
            need_to_send_notification=True,
        )


class TrainingManager:
    """TrainingManager."""

    def __init__(self):
        """__init__."""
        self.training_tasks = {}
        self.mutex = threading.Lock()
        self.garbage_collector()

    def add(self, project_id):
        """add.

        Add a project in training tasks.
        """
        if project_id in self.training_tasks:
            raise ProjectAlreadyTraining
        self.mutex.acquire()
        task = TrainingTask(project_id=project_id)
        self.training_tasks[project_id] = task
        task.start()
        self.mutex.release()

    def get_task_by_id(self, project_id):
        """get_task_by_id."""

        self.mutex.acquire()
        if project_id in self.training_tasks:
            return self.training_tasks["project_id"]
        self.mutex.release()
        return None

    def garbage_collector(self):
        """garbage_collector.

        IMPORTANT, autoreloader will not reload threading,
        please restart the server if you modify the thread.
        """

        def _gc(self):
            while True:
                self.mutex.acquire()
                if PRINT_THREAD:
                    logger.info("tasks: %s", self.training_tasks)
                to_delete = []
                for project_id in self.training_tasks:
                    if not self.training_tasks[project_id].worker.is_alive():
                        logger.info("Project %s Training Task is finished", project_id)
                        to_delete.append(project_id)

                for project_id in to_delete:
                    del self.training_tasks[project_id]

                self.mutex.release()
                time.sleep(3)

        threading.Thread(target=_gc, args=(self,), daemon=True).start()


class TrainingTask:
    """TrainingTask."""

    def __init__(self, project_id):
        """__init__.

        Args:
            project_id: Django ORM
        """
        self.project_id = project_id
        self.status = "init"
        self.worker = None

    def start(self):
        """start."""
        self.status = "running"
        self.worker = threading.Thread(
            target=train_project_catcher,
            name=f"train_project_worker_{self.project_id}",
            kwargs={"project_id": self.project_id},
            daemon=True,
        )
        self.worker.start()

    def __str__(self):
        return "<Training Task " + str(self.project_id) + ">"

    def __repr__(self):
        return "<Training Task " + str(self.project_id) + ">"


if "runserver" in sys.argv:
    TRAINING_MANAGER = TrainingManager()
else:
    TRAINING_MANAGER = None
