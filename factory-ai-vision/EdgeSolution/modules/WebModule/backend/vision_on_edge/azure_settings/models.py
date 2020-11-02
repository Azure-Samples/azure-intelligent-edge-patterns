"""App models.
"""

import logging

from azure.cognitiveservices.vision.customvision.training import (
    CustomVisionTrainingClient,
)

# pylint: disable=line-too-long
from azure.cognitiveservices.vision.customvision.training.models import (
    CustomVisionErrorException,
    Project,
)
from django.db import models
from django.db.models.signals import pre_save

# pylint: enable=line-too-long
from msrest.authentication import ApiKeyCredentials
from msrest.exceptions import ClientRequestError as MSClientRequestError

from .exceptions import (
    SettingCustomVisionAccessFailed,
    SettingCustomVisionCannotCreateProject,
)

logger = logging.getLogger(__name__)


class Setting(models.Model):
    """Setting Model."""

    name = models.CharField(max_length=100, blank=True, default="", unique=True)
    endpoint = models.CharField(max_length=1000, blank=True)
    training_key = models.CharField(max_length=1000, blank=True)
    iot_hub_connection_string = models.CharField(max_length=1000, blank=True)
    device_id = models.CharField(max_length=1000, blank=True)
    module_id = models.CharField(max_length=1000, blank=True)

    is_collect_data = models.BooleanField(default=False)

    is_trainer_valid = models.BooleanField(default=False)
    obj_detection_domain_id = models.CharField(max_length=1000, blank=True, default="")
    app_insight_has_init = models.BooleanField(default=False)

    class Meta:
        unique_together = ("endpoint", "training_key")

    def validate(self) -> bool:
        """validate.

        Returns:
            bool: is_trainer_valid
        """
        logger.info("Setting validating (%s)", self.name)
        is_trainer_valid = False
        if not self.training_key or not self.endpoint:
            return is_trainer_valid
        trainer = self.get_trainer_obj()
        try:
            trainer.get_domains()
            logger.info("Setting validate success.")
            is_trainer_valid = True
        except CustomVisionErrorException:
            logger.info("Setting validate occur CustomVisionError.")
        except MSClientRequestError:
            logger.info("Setting validate occur MSClientRequestError.")
        except (KeyError, ValueError, IndexError):
            logger.info("Setting validate occur (KeyError, ValueError, IndexError).")
        except Exception:
            logger.exception("Setting validate occur Unknown error.")
        return is_trainer_valid

    def get_trainer_obj(self) -> CustomVisionTrainingClient:
        """get_trainer_obj.

        Returns:
            CustomVisionTrainingClient:
        """
        credentials = ApiKeyCredentials(in_headers={"Training-key": self.training_key})
        return CustomVisionTrainingClient(
            credentials=credentials, endpoint=self.endpoint
        )

    def get_domain_id(
        self,
        domain_type: str = "ObjectDetection",
        domain_name: str = "General (compact)",
    ) -> str:
        """get_domain_id.

        Args:
            domain_type (str): domain_type
            domain_name (str): domain_name

        Returns:
            str: domain_id or ""
        """
        if self.validate():
            trainer = self.get_trainer_obj()
            domain = next(
                domain
                for domain in trainer.get_domains()
                if domain.type == domain_type and domain.name == domain_name
            )
            return domain.id
        return ""

    @staticmethod
    def pre_save(**kwargs):
        """pre_save.

        Validate training_key + endpoint. Update related
        fields.
        """
        logger.info("Setting pre_save")
        instance = kwargs["instance"]
        instance.is_trainer_valid = instance.validate()
        instance.obj_detection_domain_id = (
            instance.get_domain_id() if instance.is_trainer_valid else ""
        )

    def create_project(self, project_name: str, domain_id: str = None) -> Project:
        """Create Project on Custom Vision

        Args:
            name (str): Project name that will be created on customvision.

        Returns:
            project object
        """
        if not self.validate():
            raise SettingCustomVisionAccessFailed
        trainer = self.get_trainer_obj()
        domain_id = self.obj_detection_domain_id if domain_id is None else domain_id
        logger.info("Creating object detection project.")
        try:
            project = trainer.create_project(name=project_name, domain_id=domain_id)
            return project
        except CustomVisionErrorException:
            raise SettingCustomVisionCannotCreateProject

    def get_projects(self):
        """get_projects.

        List all projects.
        """
        if not self.validate():
            raise SettingCustomVisionAccessFailed
        return self.get_trainer_obj().get_projects()

    def get_project(self, project_id):
        """get_projects.

        List all projects.
        """
        if not self.validate():
            raise SettingCustomVisionAccessFailed
        return self.get_trainer_obj().get_project(project_id=project_id)

    def __str__(self):
        return self.name.__str__()

    def __repr__(self):
        return self.name.__repr__()


pre_save.connect(Setting.pre_save, Setting, dispatch_uid="Setting_pre")
