"""
Azure Setting Model
"""
import logging

from azure.cognitiveservices.vision.customvision.training import \
    CustomVisionTrainingClient
from azure.cognitiveservices.vision.customvision.training.models.custom_vision_error_py3 import \
    CustomVisionErrorException
from django.db import models
from django.db.models.signals import pre_save

logger = logging.getLogger(__name__)

# Create your models here.


class Setting(models.Model):
    """
    A wrapper model of CustomVisionTraingClient.

    Try not to pass CustomVisionTraingClient object if new model is expected to
    be created. e.g. create project, create train/iteration, etc.
    Instead, create a wrapper methods and let call, in order to sync the db
    with remote.
    """

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
    def _get_trainer_obj_static(endpoint: str, training_key: str):
        """
        return <CustomVisionTrainingClient>.
        : Success: return CustomVisionTrainingClient object
        """
        trainer = CustomVisionTrainingClient(api_key=training_key,
                                             endpoint=endpoint)
        return trainer

    def get_trainer_obj(self):
        """
        return CustomVisionTrainingClient(self.training_key, self.endpoint)
        : Success: return the CustomVisionTrainingClient object
        """
        return Setting._get_trainer_obj_static(endpoint=self.endpoint,
                                               training_key=self.training_key)

    @staticmethod
    def _validate_static(endpoint: str, training_key: str):
        """
        return tuple (is_trainer_valid, trainer)
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
        except Exception:
            trainer = None
        return is_trainer_valid, trainer

    def revalidate_and_get_trainer_obj(self):
        """
        Update all the relevent fields and return the CustimVisionClient obj.
        : Success: return CustimVisionClient object
        : Failed:  return None
        """
        is_trainer_valid, trainer = Setting._validate_static(
            self.endpoint, self.training_key)
        if is_trainer_valid:
            return trainer
        return None

    @staticmethod
    def pre_save(instance, **kwargs):
        """Setting pre_save"""
        logger.info("Setting Presave")
        try:
            logger.info("Validating CustomVisionClient %s", instance.name)
            trainer = Setting._get_trainer_obj_static(
                training_key=instance.training_key, endpoint=instance.endpoint)
            obj_detection_domain = next(
                domain for domain in trainer.get_domains()
                if domain.type == "ObjectDetection" and
                domain.name == "General (compact)")

            logger.info("Validating Trainer %s Key + Endpoint... Pass",
                        instance.name)
            instance.is_trainer_valid = True
            instance.obj_detection_domain_id = obj_detection_domain.id
        except CustomVisionErrorException as customvision_err:
            logger.error("Setting Presave occur CustomVisionError: %s",
                         customvision_err)
            logger.error(
                "Set is_trainer_valid to False, obj_detection_domain_id to ''")
            instance.is_trainer_valid = False
            instance.obj_detection_domain_id = ""
        except KeyError as key_err:
            logger.error("Setting Presave occur KeyError: %s", key_err)
            logger.error(
                "Set is_trainer_valid to False, obj_detection_domain_id to ''")
            instance.is_trainer_valid = False
            instance.obj_detection_domain_id = ""
        except Exception as unexpected_error:
            logger.exception("Setting Presave: Unexpected Error")
            raise unexpected_error
        finally:
            logger.info("Setting Presave... End")

    def create_project(self, project_name: str):
        """
        : Success: return project
        : Failed:  return None
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
        except CustomVisionErrorException as customvision_err:
            logger.error("Setting creating_project errors %s",
                         customvision_err)
            return None
        except Exception:
            logger.exception("Setting Presave: Unexpected Error")
            raise

    def delete_project(self, project_id: str):
        """
        : Success: return project
        : Failed:  return None
        """

    def __str__(self):
        return self.name


pre_save.connect(Setting.pre_save, Setting, dispatch_uid="Setting_pre")
