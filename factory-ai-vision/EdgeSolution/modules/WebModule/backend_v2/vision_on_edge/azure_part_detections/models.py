# -*- coding: utf-8 -*-
"""App Models.
"""

import logging
import threading

import requests
from django.db import models
from django.db.models.signals import post_save

from ..azure_iot.utils import inference_module_url
from ..azure_projects.models import Project
from ..cameras.models import Camera
from ..locations.models import Location
from ..azure_parts.models import Part
from ..inference_modules.models import InferenceModule

logger = logging.getLogger(__name__)


class PartDetection(models.Model):
    """PartDetection Model
    """

    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True)
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE, null=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, null=True)
    inference = models.ForeignKey(InferenceModule,
                                  on_delete=models.CASCADE,
                                  null=True)
    part = models.ManyToManyField(Part)
    needRetraining = models.BooleanField(default=True)
    deployed = models.BooleanField(default=False)
    has_configured = models.BooleanField(default=False)
    # delete_inference : bool

    accuracyRangeMin = models.IntegerField(default=30)
    accuracyRangeMax = models.IntegerField(default=80)
    retraining_counter = models.IntegerField(default=0)
    metrics_is_send_iothub = models.BooleanField(default=False)
    metrics_accuracy_threshold = models.IntegerField(default=50)
    metrics_frame_per_minutes = models.IntegerField(default=6)
    prob_threshold = models.IntegerField(default=10)

    @staticmethod
    def post_save(created, update_fields, **kwargs):
        """Project post_save
        """
        logger.info("Project post_save")
        instance = kwargs["instance"]

        if not instance.has_configured:
            logger.error("This project is not configured to inference")
            logger.error("Not sending any request to inference")
            return

        confidence_min = 30
        confidence_max = 80
        max_images = 10
        metrics_is_send_iothub = False
        metrics_accuracy_threshold = 50
        metrics_frame_per_minutes = 6

        logger.info("Saving instance: %s %s", instance, update_fields)

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

            requests.get(
                "http://" + inference_module_url() +
                "/update_iothub_parameters",
                params={
                    "is_send": metrics_is_send_iothub,
                    "threshold": metrics_accuracy_threshold,
                    "fpm": metrics_frame_per_minutes,
                },
            )

        threading.Thread(target=_r,
                         args=(confidence_min, confidence_max,
                               max_images)).start()

        if update_fields is not None:
            return
        if not created:
            logger.info("Project modified")

        logger.info("Project post_save... End")

    def update_prob_threshold(self, prob_threshold):
        """update confidenece threshold of BoundingBox
        """
        self.prob_threshold = prob_threshold

        if prob_threshold > 100 or prob_threshold < 0:
            raise ValueError("prob_threshold out of range")

        requests.get(
            "http://" + inference_module_url() + "/update_prob_threshold",
            params={
                "prob_threshold": prob_threshold,
            },
        )
        self.save(update_fields=["prob_threshold"])


post_save.connect(PartDetection.post_save,
                  PartDetection,
                  dispatch_uid="PartDetection_post")
