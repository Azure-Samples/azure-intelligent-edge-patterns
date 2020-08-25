# -*- coding: utf-8 -*-
"""App Models."""

import logging
import uuid as uuid_lib

from azure.cognitiveservices.vision.customvision.training import \
    CustomVisionTrainingClient
# pylint: disable=line-too-long
from azure.cognitiveservices.vision.customvision.training.models.custom_vision_error_py3 import \
    CustomVisionErrorException
from django.db import models
from django.db.models.signals import pre_save
# pylint: enable=line-too-long
from msrest.exceptions import ClientRequestError as MSClientRequestError

logger = logging.getLogger(__name__)

# Create your models here.


class Setting(models.Model):
    """A wrapper model of CustomVisionTraingClient.
    """

    uuid = models.UUIDField(  # Used by the API to look up the record
        db_index=True,
        default=uuid_lib.uuid4,
        editable=False,
        unique=True)
    name = models.CharField(max_length=100,
                            blank=True,
                            default="",
                            unique=True)
    endpoint = models.CharField(max_length=1000, blank=True)
    training_key = models.CharField(max_length=1000, blank=True)
    iot_hub_connection_string = models.CharField(max_length=1000, blank=True)
    device_id = models.CharField(max_length=1000, blank=True)
    module_id = models.CharField(max_length=1000, blank=True)

    is_collect_data = models.BooleanField(default=False)

    is_trainer_valid = models.BooleanField(default=False)
    obj_detection_domain_id = models.CharField(max_length=1000,
                                               blank=True,
                                               default="")
    app_insight_has_init = models.BooleanField(default=False)

    class Meta:
        unique_together = ("endpoint", "training_key")

    @staticmethod
    def _get_trainer_obj_static(endpoint: str, training_key: str
                               ) -> CustomVisionTrainingClient:
        """_get_trainer_obj_static.

        Args:
            endpoint (str): endpoint
            training_key (str): training_key

        Returns:
            CustomVisionTrainingClient:
        """
        trainer = CustomVisionTrainingClient(api_key=training_key,
                                             endpoint=endpoint)
        return trainer

    def get_trainer_obj(self) -> CustomVisionTrainingClient:
        """get_trainer_obj.

        Returns:
            CustomVisionTrainingClient:
        """
        return Setting._get_trainer_obj_static(endpoint=self.endpoint,
                                               training_key=self.training_key)

    @staticmethod
    def _validate_static(endpoint: str, training_key: str):
        """Validate an endpoint, training_key pair.

        Args:
            endpoint (str)
            training_key (str)

        Returns:
            (is_trainer_valid, trainer)
        """
        logger.info("Validatiing %s %s", endpoint, training_key)
        trainer = Setting._get_trainer_obj_static(endpoint=endpoint,
                                                  training_key=training_key)
        is_trainer_valid = False
        try:
            trainer.get_domains()
            is_trainer_valid = True
        except CustomVisionErrorException:
            trainer = None
        except MSClientRequestError:
            trainer = None
        except Exception:
            trainer = None
        return is_trainer_valid, trainer

    def revalidate_and_get_trainer_obj(self):
        """Revalidate training_key, endpoint. Update all the relevent fields.

        Args:
            self: Setting instance

        Returns:
            <CustomVisionTrainingClient> or None
        """
        is_trainer_valid, trainer = Setting._validate_static(
            self.endpoint, self.training_key)
        if is_trainer_valid:
            return trainer
        return None

    @staticmethod
    def pre_save(**kwargs):
        """pre_save.

        Validate training_key + endpoint. Update related
        fields.

        Args:
            kwargs:
        """

        logger.info("Setting Presave")
        if 'instance' not in kwargs:
            return
        instance = kwargs['instance']
        try:
            logger.info("Validating CustomVisionClient %s", instance.name)
            trainer = Setting._get_trainer_obj_static(
                training_key=instance.training_key, endpoint=instance.endpoint)
            obj_detection_domain = next(
                domain for domain in trainer.get_domains()
                if domain.type == "ObjectDetection" and
                domain.name == "General (compact)")

            logger.info("Setting %s is valid", instance.name)
            instance.is_trainer_valid = True
            instance.obj_detection_domain_id = obj_detection_domain.id
            return
        except CustomVisionErrorException:
            logger.info("Setting Presave occur CustomVisionError")
        except KeyError:
            logger.info("Setting pre_save occur KeyError")
        except MSClientRequestError:
            logger.info("Setting pre_save occur MSClientRequestError...")
        except Exception:
            logger.info("Setting pre_save occur unexpected Error...")
        logger.info("Setting.is_trainer_valid = False")
        logger.info("Setting.obj_detection_domain = ''")
        instance.is_trainer_valid = False
        instance.obj_detection_domain_id = ""

    def create_project(self, project_name: str):
        """Create Project on Custom Vision

        Args:
            name (str): Project name that will be created on customvision.

        Returns:
            project object
        """
        trainer = self.revalidate_and_get_trainer_obj()
        logger.info("Creating obj detection project")
        logger.info("Trainer: %s", trainer)
        if not trainer:
            logger.info("Trainer is invalid thus cannot create project")
            return None
        try:
            project = trainer.create_project(
                name=project_name, domain_id=self.obj_detection_domain_id)
            return project
        except CustomVisionErrorException:
            logger.error("Create project occur CustomVisionErrorException")
        except MSClientRequestError:
            logger.exception("Create project occur MSClientRequestError")
        except Exception:
            logger.exception("Create project occur unexpected error...")
            raise
        return None

    def __str__(self):
        return self.name

pre_save.connect(Setting.pre_save, Setting, dispatch_uid="Setting_pre")
