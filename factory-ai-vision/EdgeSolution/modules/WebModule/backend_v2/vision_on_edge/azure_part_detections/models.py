"""App models.
"""

import logging

import requests
from django.db import models
from django.utils import timezone
from rest_framework.exceptions import APIException

from ..azure_parts.models import Part
from ..azure_projects.models import Project
from ..cameras.models import Camera
from ..inference_modules.models import InferenceModule
from .exceptions import (
    PdDeployWithoutCameras,
    PdDeployWithoutInferenceModule,
    PdDeployWithoutProject,
    PdProbThresholdNotInteger,
    PdProbThresholdOutOfRange,
)

logger = logging.getLogger(__name__)

INFERENCE_MODE_CHOICES = [
    ("PD", "part_detection"),
    ("PC", "part_counting"),
    ("ES", "employee_safety"),
    ("DD", "defect_detection"),
]


class PartDetection(models.Model):
    """PartDetection Model"""

    name = models.CharField(blank=True, max_length=200)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True)
    cameras = models.ManyToManyField(Camera, blank=True)
    inference_module = models.ForeignKey(
        InferenceModule, on_delete=models.SET_NULL, null=True
    )
    inference_mode = models.CharField(
        max_length=40, choices=INFERENCE_MODE_CHOICES, default="PD"
    )
    parts = models.ManyToManyField(Part, blank=True)
    needRetraining = models.BooleanField(default=True)
    deployed = models.BooleanField(default=False)
    deploy_timestamp = models.DateTimeField(default=timezone.now)
    has_configured = models.BooleanField(default=False)

    accuracyRangeMin = models.IntegerField(default=30)
    accuracyRangeMax = models.IntegerField(default=80)

    maxImages = models.IntegerField(default=10)
    metrics_is_send_iothub = models.BooleanField(default=False)
    metrics_accuracy_threshold = models.IntegerField(default=50)
    metrics_frame_per_minutes = models.IntegerField(default=6)
    prob_threshold = models.IntegerField(default=60)
    send_video_to_cloud = models.BooleanField(default=False)
    fps = models.IntegerField(default=10)

    def update_prob_threshold(self, prob_threshold):
        """update confidenece threshold of BoundingBox"""
        self.prob_threshold = prob_threshold

        if not isinstance(prob_threshold, int):
            raise PdProbThresholdNotInteger
        if prob_threshold > 100 or prob_threshold < 0:
            raise PdProbThresholdOutOfRange
        self.save()
        requests.get(
            "http://" + self.inference_module.url + "/update_prob_threshold",
            params={"prob_threshold": prob_threshold},
        )

    def is_deployable(self, raise_exception: bool = False) -> bool:
        try:
            if not self.inference_module:
                raise PdDeployWithoutInferenceModule
            if not self.project:
                raise PdDeployWithoutProject
            if not self.cameras.all().exists():
                raise PdDeployWithoutCameras
            self.project.is_deployable(raise_exception=True)
            return True
        except APIException:
            if raise_exception:
                raise
            return False

    def __str__(self) -> str:
        return self.name.__str__()

    def __repr__(self) -> str:
        return self.name.__repr__()


class PDScenario(models.Model):
    """PartDetection Model"""

    name = models.CharField(blank=True, max_length=200)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True)
    cameras = models.ManyToManyField(Camera, blank=True)
    inference_mode = models.CharField(
        max_length=40, choices=INFERENCE_MODE_CHOICES, default="PD"
    )
    parts = models.ManyToManyField(Part, blank=True)
