"""
Models for Azure Custom Vision training.
"""
import datetime
import logging
import threading
import time

import requests
from azure.cognitiveservices.vision.customvision.training.models.custom_vision_error_py3 import \
    CustomVisionErrorException
from azure.iot.device import IoTHubModuleClient
from django.db import models
from django.db.models.signals import post_save, pre_save

from ..azure_parts.models import Part
from ..azure_settings.models import Setting
from ..cameras.models import Camera
from ..images.models import Image
from ..locations.models import Location
from .utils.app_insight import (get_app_insight_logger, img_monitor,
                                part_monitor, retraining_job_monitor,
                                training_job_monitor)

logger = logging.getLogger(__name__)


def is_edge():
    """Determine is edge or not. Return bool"""
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except:
        return False


def inference_module_url():
    """Return Inference URL"""
    if is_edge():
        return "172.18.0.1:5000"
    return "localhost:5000"


# Create your models here.


class Project(models.Model):
    """Project Model"""

    setting = models.ForeignKey(Setting, on_delete=models.CASCADE, default=1)
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE, null=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True)
    parts = models.ManyToManyField(Part, related_name="part")
    customvision_project_id = models.CharField(max_length=200,
                                               null=True,
                                               blank=True,
                                               default="")
    customvision_project_name = models.CharField(max_length=200,
                                                 null=True,
                                                 blank=True,
                                                 default="")
    download_uri = models.CharField(max_length=1000,
                                    null=True,
                                    blank=True,
                                    default="")
    needRetraining = models.BooleanField(default=True)
    training_counter = models.IntegerField(default=0)
    is_demo = models.BooleanField(default=False)
    deployed = models.BooleanField(default=False)
    has_configured = models.BooleanField(default=False)

    # TODO: Move this to a new App.
    # e.g. relabel
    accuracyRangeMin = models.IntegerField(default=30)
    accuracyRangeMax = models.IntegerField(default=80)
    maxImages = models.IntegerField(default=20)
    retraining_counter = models.IntegerField(default=0)
    metrics_is_send_iothub = models.BooleanField(default=False)
    metrics_accuracy_threshold = models.IntegerField(default=50)
    metrics_frame_per_minutes = models.IntegerField(default=6)

    prob_threshold = models.IntegerField(default=10)

    @staticmethod
    def pre_save(sender, instance, update_fields, **kwargs):
        """Project pre_save"""
        logger.info("Project pre_save")
        logger.info("Saving instance: %s %s", instance, update_fields)
        if update_fields is not None:
            return
        # if instance.id is not None:
        #    return

        trainer = instance.setting.revalidate_and_get_trainer_obj()
        if instance.is_demo:
            logger.info("Project instance.is_demo: %s", instance.is_demo)
        elif trainer and instance.customvision_project_id:
            # Endpoint and Training_key is valid, and trying to save with
            # customvision_project_id...
            logger.info("Project CustomVision Id: %s",
                        instance.customvision_project_id)
            try:
                trainer.get_project(instance.customvision_project_id)
            except CustomVisionErrorException as customvision_err:
                logger.error(customvision_err)
                logger.error(
                    "Project %s not belong to Training Key + Endpoint pair.",
                    instance.customvision_project_id)
                logger.error("Set Project Id to ''")
                instance.customvision_project_id = ""
            except:
                logger.exception("Unexpected error")
        elif trainer:
            # Endpoint and Training_key is valid, and trying to save without
            # customvision_project_id
            logger.info("Setting project name")
            try:
                if not instance.customvision_project_name:
                    raise ValueError("Use Default")
                name = instance.customvision_project_name
            except:
                name = "VisionOnEdge-" + datetime.datetime.utcnow().isoformat()
                instance.customvision_project_name = name
            logger.info("Setting project name: %s",
                        instance.customvision_project_name)

            # logger.info('Creating Project on Custom Vision')
            # project = instance.setting.create_project(name)
            # logger.info(
            #    f'Got Custom Vision Project Id: {project.id}. Saving...')
            # instance.customvision_project_id = project.id
        else:
            instance.customvision_project_id = ""
        logger.info("Project pre_save... End")

    @staticmethod
    def post_save(sender, instance, created, update_fields, **kwargs):
        """Project post_save"""
        logger.info("Project post_save")
        logger.info("Saving instance: %s %s", instance, update_fields)

        confidence_min = 30
        confidence_max = 80
        max_images = 10
        metrics_is_send_iothub = False
        metrics_accuracy_threshold = 50
        metrics_frame_per_minutes = 6

        if instance.accuracyRangeMin is not None:
            confidence_min = instance.accuracyRangeMin

        if instance.accuracyRangeMax is not None:
            confidence_max = instance.accuracyRangeMax

        if instance.maxImages is not None:
            max_images = instance.maxImages

        if instance.metrics_is_send_iothub is not None:
            metrics_is_send_iothub = instance.metrics_is_send_iothub
        if instance.metrics_accuracy_threshold is not None:
            metrics_accuracy_threshold = instance.metrics_accuracy_threshold
        if instance.metrics_frame_per_minutes is not None:
            metrics_frame_per_minutes = instance.metrics_frame_per_minutes

        def _r(confidence_min, confidence_max, max_images):
            requests.get(
                "http://" + inference_module_url() +
                "/update_retrain_parameters",
                params={
                    "confidence_min": confidence_min,
                    "confidence_max": confidence_max,
                    "max_images": max_images,
                },
            )

            requests.get('http://' + inference_module_url() +
                         '/update_iothub_parameters',
                         params={
                             'is_send': metrics_is_send_iothub,
                             'threshold': metrics_accuracy_threshold,
                             'fpm': metrics_frame_per_minutes,
                         })

        threading.Thread(target=_r,
                         args=(confidence_min, confidence_max,
                               max_images)).start()

        if update_fields is not None:
            return
        if not created:
            logger.info("Project modified")

        logger.info("Project post_save... End")

    @staticmethod
    def pre_delete(sender, instance, using):
        """pre_delete"""

    def dequeue_iterations(self, max_iterations=2):
        """Dequeue training iterations of a project"""
        try:
            trainer = self.setting.revalidate_and_get_trainer_obj()
            if not trainer:
                return
            if not self.customvision_project_id:
                return
            iterations = trainer.get_iterations(self.customvision_project_id)
            if len(iterations) > max_iterations:
                # TODO delete train in Train Model
                trainer.delete_iteration(self.customvision_project_id,
                                         iterations[-1].as_dict()["id"])
        except CustomVisionErrorException as customvision_err:
            logger.error(customvision_err)
        except:
            logger.exception("dequeue_iteration error")
            raise

    def upcreate_training_status(self,
                                 status: str,
                                 log: str,
                                 performance: str = "{}"):
        """
        A wrapper function to create or update the training status of a
        project
        """
        logger.info("Updating Training Status: %s %s", status, log)
        obj, created = Train.objects.update_or_create(
            project=self,
            defaults={
                "status": status,
                "log": "Status : " + log.capitalize(),
                "performance": performance
            },
        )
        return obj, created

    def create_project(self):
        """Create a project for local project_obj (self) on CustomVision"""
        trainer = self.setting.get_trainer_obj()
        logger.info("Creating obj detection project")
        try:
            if not self.customvision_project_name:
                self.customvision_project_name = (
                    "VisionOnEdge-" + datetime.datetime.utcnow().isoformat())
            project = trainer.create_project(
                name=self.customvision_project_name,
                domain_id=self.setting.obj_detection_domain_id,
            )
            self.customvision_project_id = project.id
            update_fields = [
                "customvision_project_id", "customvision_project_name"
            ]
            self.save(update_fields=update_fields)
        except CustomVisionErrorException as customvision_err:
            logger.error("Project create_project error %s", customvision_err)
            raise customvision_err
        except:
            logger.exception("Project create_project: Unexpected Error")
            raise

    def delete_tag_by_name(self, tag_name):
        """delete tag on custom vision"""
        logger.info("deleting tag: %s", tag_name)
        if not self.setting.is_trainer_valid:
            return
        if not self.customvision_project_id:
            return
        trainer = self.setting.get_trainer_obj()
        tags = trainer.get_tags(project_id=self.customvision_project_id)
        for tag in tags:
            if tag.name.lower() == tag_name.lower():
                trainer.delete_tag(project_id=self.customvision_project_id,
                                   tag_id=tag.id)
                logger.info("tag deleted: %s", tag_name)
                return

    def delete_tag_by_id(self, tag_id):
        """delete tag on custom vision"""
        logger.info("deleting tag: %s", tag_id)

        if not self.setting.is_trainer_valid:
            return
        if not self.customvision_project_id:
            return
        trainer = self.setting.get_trainer_obj()
        trainer.delete_tag(project_id=self.customvision_project_id,
                           tag_id=tag_id)
        return

    def update_app_insight_counter(
            self,
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
                self.training_counter += 1
                self.save(update_fields=["training_counter"])
                train = 1
            elif has_new_images:
                logger.info("This is a re-training job")
                self.retraining_counter += 1
                self.save(update_fields=["retraining_counter"])
                retrain = 1
            else:
                logger.info("Project not changed")
            logger.info("Sending Data to App Insight %s",
                        self.setting.is_collect_data)
            if self.setting.is_collect_data:

                # Metrics
                logger.info("Sending Logs to App Insight")
                # TODO: Move this to other places to aviod import Part
                part_monitor(len(Part.objects.filter(is_demo=False)))
                # TODO: Move this to other places to aviod import Image
                img_monitor(len(Image.objects.all()))
                training_job_monitor(self.training_counter)
                retraining_job_monitor(self.retraining_counter)
                trainer = self.setting.get_trainer_obj()
                images_now = trainer.get_tagged_image_count(
                    self.customvision_project_id)
                parts_now = len(trainer.get_tags(self.customvision_project_id))
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
            logger.exception(
                "update_app_insight_counter occur unexcepted error")
            raise

    def train_project(self):
        """
        Submit training task to CustomVision.
        Return training task submit result (boolean)
        : Success: return True
        : Failed : return False
        """
        is_task_success = False
        update_fields = []

        try:
            # Get CustomVisionClient
            trainer = self.setting.revalidate_and_get_trainer_obj()
            if not trainer:
                logger.error("Trainer is invalid. Not going to train...")

            # Submit training task to CustomVision
            logger.info("%s submit training task to CustomVision",
                        self.customvision_project_name)
            trainer.train_project(self.customvision_project_id)
            # Set deployed
            self.deployed = False
            update_fields.append("deployed")
            logger.info("set deployed = False")

            # If all above is success
            is_task_success = True
            return is_task_success
        except CustomVisionErrorException as customvision_err:
            logger.error("From Custom Vision: %s", customvision_err.message)
            raise
        except Exception:
            logger.exception("Unexpected error while Project.train_project")
            raise
        finally:
            self.save(update_fields=update_fields)

    def export_iterationv3_2(self, iteration_id):
        """
        CustomVisionTrainingClient SDK may have some issues exporting
        Use the REST API
        """
        # trainer.export_iteration(customvision_project_id,
        # iteration.id,
        # 'ONNX')
        setting_obj = self.setting
        url = (setting_obj.endpoint + "customvision/v3.2/training/projects/" +
               self.customvision_project_id + "/iterations/" + iteration_id +
               "/export?platform=ONNX")
        res = requests.post(url,
                            "{body}",
                            headers={"Training-key": setting_obj.training_key})
        return res

    def update_prob_threshold(self, prob_threshold):
        """update confidenece threshold of BoundingBox
        """
        self.prob_threshold = prob_threshold

        if prob_threshold > 100 or prob_threshold < 0:
            raise ValueError('prob_threshold out of range')

        requests.get(
            "http://" + inference_module_url() + "/update_prob_threshold",
            params={
                "prob_threshold": prob_threshold,
            },
        )
        self.save(update_fields=['prob_threshold'])


class Train(models.Model):
    """Training Status Model"""

    status = models.CharField(max_length=200)
    log = models.CharField(max_length=1000)
    performance = models.CharField(max_length=1000, default="{}")
    project = models.ForeignKey(Project, on_delete=models.CASCADE)


class Task(models.Model):
    """Task Model"""

    task_type = models.CharField(max_length=100)
    status = models.CharField(max_length=200)
    log = models.CharField(max_length=1000)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    def start_exporting(self):
        """Start Exporting"""

        def _export_worker(self):
            """Export Model Worker"""
            project_obj = self.project
            trainer = project_obj.setting.revalidate_and_get_trainer_obj()
            customvision_project_id = project_obj.customvision_project_id
            while True:
                time.sleep(1)
                iterations = trainer.get_iterations(customvision_project_id)
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

                exports = trainer.get_exports(customvision_project_id,
                                              iteration.id)
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
                project_obj.download_uri = exports[0].download_uri
                project_obj.save()
                break
            return

        threading.Thread(target=_export_worker, args=(self,)).start()


pre_save.connect(Project.pre_save, Project, dispatch_uid="Project_pre")
post_save.connect(Project.post_save, Project, dispatch_uid="Project_post")
