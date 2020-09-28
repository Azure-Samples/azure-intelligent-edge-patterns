"""App models.
"""

import datetime
import logging
import threading
import time

import requests
from azure.cognitiveservices.vision.customvision.training.models import (
    CustomVisionErrorException,
)
from django.db import models
from django.db.models.signals import pre_save
from django.utils import timezone
from msrest.exceptions import DeserializationError as MSDeserializationError

from ..azure_settings.exceptions import SettingCustomVisionAccessFailed
from ..azure_settings.models import Setting
from .exceptions import (
    ProjectCannotChangeDemoError,
    ProjectCustomVisionError,
    ProjectResetWithoutNameError,
    ProjectWithoutSettingError,
)

logger = logging.getLogger(__name__)


class Project(models.Model):
    """Project Model."""

    setting = models.ForeignKey(Setting, on_delete=models.CASCADE, null=True)
    customvision_id = models.CharField(
        max_length=200, null=True, blank=True, default=""
    )
    name = models.CharField(max_length=200, null=True, blank=True, default="")
    download_uri = models.CharField(max_length=1000, null=True, blank=True, default="")
    training_counter = models.IntegerField(default=0)
    is_demo = models.BooleanField(default=False)

    retraining_counter = models.IntegerField(default=0)
    maxImages = models.IntegerField(default=20)
    needRetraining = models.BooleanField(default=True)
    relabel_expired_time = models.DateTimeField(default=timezone.now)

    def __repr__(self):
        return self.name.__repr__()

    def __str__(self):
        return self.name.__str__()

    def reset(self, name: str = None):
        """reset.

        Args:
            name (str): name
        """
        if name is None:
            raise ProjectResetWithoutNameError
        self.customvision_id = ""
        self.name = name
        self.download_uri = ""
        self.needRetraining = Project._meta.get_field("needRetraining").get_default()
        self.maxImages = Project._meta.get_field("maxImages").get_default()
        self.create_project()

    def get_trainer_obj(self):
        """get_trainer_obj."""
        if not self.setting:
            raise ProjectWithoutSettingError
        if not self.setting.is_trainer_valid:
            raise SettingCustomVisionAccessFailed
        return self.setting.get_trainer_obj()

    def get_project_obj(self):
        """get_project_obj."""
        if not self.setting:
            raise ProjectWithoutSettingError
        if not self.customvision_id:
            raise ProjectCustomVisionError
        trainer = self.setting.get_trainer_obj()
        return trainer.get_project(self.customvision_id)

    def validate(self, raise_exception: bool = False) -> bool:
        """validate.

        Returns:
            bool: if project customvision_id valid
        """
        if not self.setting:
            if raise_exception:
                raise ProjectWithoutSettingError
            return False
        try:
            self.get_project_obj()
            logger.info("Project %s validate pass.", self.name)
            return True
        except Exception:
            logger.info("Project %s validate failed.", self.name)
            if raise_exception:
                raise ProjectCustomVisionError
            return False

    @staticmethod
    def pre_save(**kwargs):
        """pre_save.

        Args:
            kwargs:
        """
        logger.info("Project pre_save start")
        instance = kwargs["instance"]
        update_fields = kwargs["update_fields"]

        # Pass if update relabel_only
        if update_fields == frozenset({"relabel_expired_time"}):
            logger.info("Pass pre_save (relabel_keep_alive)")
            return

        # Don't change demo project
        if instance.is_demo and instance.id:
            raise ProjectCannotChangeDemoError

        # Set default name
        instance.name = (
            instance.name or "VisionOnEdge-" + datetime.datetime.utcnow().isoformat()
        )

        logger.info(
            "Project (id, customvision_id, name): (%s, %s, %s)",
            instance.id,
            instance.customvision_id,
            instance.name,
        )
        try:
            project = instance.get_project_obj()
            instance.name = project.name
            logger.info("Project Found. Set instance.name to %s", instance.name)
        except Exception:
            instance.customvision_id = ""
        logger.info(
            "Project (id, customvision_id, name): (%s, %s, %s)",
            instance.id,
            instance.customvision_id,
            instance.name,
        )
        logger.info("Project pre_save end")

    def dequeue_iterations(self, max_iterations: int = 2):
        """dequeue_iterations.

        Args:
            max_iterations (int): max_iterations
        """
        try:
            if not self.setting or not self.setting.validate():
                return
            if not self.customvision_id:
                return
            trainer = self.setting.get_trainer_obj()
            iterations = trainer.get_iterations(self.customvision_id)
            if len(iterations) > max_iterations:
                trainer.delete_iteration(
                    self.customvision_id, iterations[-1].as_dict()["id"]
                )
        except CustomVisionErrorException as customvision_err:
            logger.error(customvision_err)
        except:
            logger.exception("dequeue_iteration error")
            raise

    def create_project(self):
        """create_project.

        Create a project on CustomVision.
        """
        logger.info("Creating obj detection project")

        trainer = self.setting.get_trainer_obj()
        try:
            if not self.name:
                self.name = "VisionOnEdge-" + datetime.datetime.utcnow().isoformat()
            project = trainer.create_project(
                name=self.name, domain_id=self.setting.obj_detection_domain_id
            )
            self.customvision_id = project.id
            self.name = project.name
            update_fields = ["customvision_id", "name"]
            self.save(update_fields=update_fields)
        except CustomVisionErrorException as customvision_err:
            logger.error("Project create_project error %s", customvision_err)
            raise customvision_err
        except:
            logger.exception("Project create_project: Unexpected Error")
            raise

    def delete_tag_by_name(self, tag_name) -> None:
        """delete_tag_by_name.

        Delete tag on Custom Vision.

        Args:
            tag_name: Tag name to search on Custom Vision.
        """
        logger.info("deleting tag: %s", tag_name)
        if not self.validate():
            raise ProjectCustomVisionError
        trainer = self.setting.get_trainer_obj()
        tags = trainer.get_tags(project_id=self.customvision_id)
        for tag in tags:
            if tag.name.lower() == tag_name.lower():
                trainer.delete_tag(project_id=self.customvision_id, tag_id=tag.id)
                logger.info("tag deleted: %s", tag_name)
                return

    def delete_tag_by_id(self, tag_id) -> None:
        """delete_tag_by_id.

        Delete tag on Custom Vision.

        Args:
            tag_id: Tag id.
        """
        logger.info("Deleting tag: %s", tag_id)
        if not self.validate():
            raise ProjectCustomVisionError
        trainer = self.setting.get_trainer_obj()
        trainer.delete_tag(project_id=self.customvision_id, tag_id=tag_id)

    def train_project(self):
        """train_project.

        Submit training task to CustomVision.
        Return training task submit result (boolean)
        : Success: return True
        : Failed : return False
        """
        is_task_success = False
        if not self.setting:
            raise ProjectWithoutSettingError
        if not self.setting.validate():
            raise SettingCustomVisionAccessFailed
        trainer = self.setting.get_trainer_obj()
        # Submit training task to CustomVision
        logger.info(
            "%s %s submit training task to CustomVision",
            self.customvision_id,
            self.name,
        )
        trainer.train_project(self.customvision_id)

        # If all above is success
        is_task_success = True
        return is_task_success

    def export_iterationv3_2(self, iteration_id):
        """export_iterationv3_2.

        CustomVisionTrainingClient SDK may have some issues exporting.
        Use the REST API
        """
        # trainer.export_iteration(customvision_id,
        # iteration.id,
        # 'ONNX')
        setting_obj = self.setting
        url = (
            setting_obj.endpoint
            + "customvision/v3.2/training/projects/"
            + self.customvision_id
            + "/iterations/"
            + iteration_id
            + "/export?platform=ONNX"
        )
        res = requests.post(
            url, "{body}", headers={"Training-key": setting_obj.training_key}
        )
        return res


class Task(models.Model):
    """Task Model"""

    task_type = models.CharField(max_length=100)
    status = models.CharField(max_length=200)
    log = models.CharField(max_length=1000)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    def start_exporting(self):
        """start_exporting."""

        def _export_worker(self):
            """Export Model Worker"""
            project_obj = self.project
            trainer = project_obj.setting.get_trainer_obj()
            customvision_id = project_obj.customvision_id
            while True:
                time.sleep(1)
                iterations = trainer.get_iterations(customvision_id)
                if len(iterations) == 0:
                    logger.error("failed: not yet trained")
                    self.status = "running"
                    self.log = "failed: not yet trained"
                    self.save()
                    return

                iteration = iterations[0]
                if not iteration.exportable or iteration.status != "Completed":
                    self.status = "running"
                    self.log = "Status : training model"
                    self.save()
                    continue

                exports = trainer.get_exports(customvision_id, iteration.id)
                if len(exports) == 0 or not exports[0].download_uri:
                    logger.info("Status: exporting model")
                    self.status = "running"
                    self.log = "Status : exporting model"
                    res = project_obj.export_iterationv3_2(iteration.id)
                    self.save()
                    logger.info(res.json())
                    continue

                logger.info(
                    "Successfully export model. download_uri: %s",
                    exports[0].download_uri,
                )
                self.status = "ok"
                self.log = "Status : work done"
                self.save()
                # Get the latest object
                project_obj = Project.objects.get(pk=project_obj.id)
                project_obj.download_uri = exports[0].download_uri
                project_obj.save()
                break
            return

        threading.Thread(target=_export_worker, args=(self,)).start()


pre_save.connect(Project.pre_save, Project, dispatch_uid="Project_pre")
