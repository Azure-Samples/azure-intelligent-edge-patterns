# -*- coding: utf-8 -*-
"""App models.
"""

import logging
import threading

import requests
from django.db import models
from django.db.models.signals import post_save

from ..azure_parts.models import Part
from ..azure_projects.models import Project
from ..cameras.models import Camera
from ..inference_modules.models import InferenceModule

logger = logging.getLogger(__name__)


class PartDetection(models.Model):
    """PartDetection Model
    """

    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True)
    camera = models.ForeignKey(Camera, on_delete=models.CASCADE, null=True)
    inference_module = models.ForeignKey(InferenceModule,
                                         on_delete=models.CASCADE,
                                         null=True)
    parts = models.ManyToManyField(Part)
    needRetraining = models.BooleanField(default=True)
    deployed = models.BooleanField(default=False)
    has_configured = models.BooleanField(default=False)

    accuracyRangeMin = models.IntegerField(default=30)
    accuracyRangeMax = models.IntegerField(default=80)

    maxImage = models.IntegerField(default=10)
    metrics_is_send_iothub = models.BooleanField(default=False)
    metrics_accuracy_threshold = models.IntegerField(default=50)
    metrics_frame_per_minutes = models.IntegerField(default=6)
    prob_threshold = models.IntegerField(default=10)

    @staticmethod
    def post_save(**kwargs):
        """PartDetection post_save
        """
        logger.info("PartDetection post_save")
        instance = kwargs["instance"]

        if not instance.has_configured:
            logger.error("This PartDetection is not configured")
            logger.error("Not sending any request to inference")
            return

        confidence_min = getattr(instance, 'accuracyRangeMin', 30)
        confidence_max = getattr(instance, 'accuracyRangeMax', 80)
        max_images = getattr(instance, 'maxImages', 10)
        metrics_is_send_iothub = getattr(instance, 'metrics_is_send_iothub',
                                         False)
        metrics_accuracy_threshold = getattr(instance,
                                             'metrics_accuracy_threshold', 50)
        metrics_frame_per_minutes = getattr(instance,
                                            'metrics_frame_per_minutes', 6)

        def _r(confidence_min, confidence_max, max_images):
            requests.get(
                "http://" + instance.inference_module.url +
                "/update_part_detection_id",
                params={
                    "part_detection_id": instance.id,
                },
            )
            requests.get(
                "http://" + instance.inference_module.url +
                "/update_retrain_parameters",
                params={
                    "confidence_min": confidence_min,
                    "confidence_max": confidence_max,
                    "max_images": max_images,
                },
            )

            requests.get(
                "http://" + instance.inference_module.url +
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

        logger.info("PartDetection post_save... End")

    def update_prob_threshold(self, prob_threshold):
        """update confidenece threshold of BoundingBox
        """
        self.prob_threshold = prob_threshold

        if prob_threshold > 100 or prob_threshold < 0:
            raise ValueError("prob_threshold out of range")

        requests.get(
            "http://" + self.inference_module.url + "/update_prob_threshold",
            params={
                "prob_threshold": prob_threshold,
            },
        )
        self.save(update_fields=["prob_threshold"])


post_save.connect(PartDetection.post_save,
                  PartDetection,
                  dispatch_uid="PartDetection_post")
