"""App models.
"""

import json
import logging
from io import BytesIO

import requests
from django.core import files
from django.db import models
from django.db.models.signals import pre_save
from PIL import Image as PILImage
from rest_framework import status

from ..azure_parts.models import Part
from ..azure_projects.models import Project
from ..cameras.models import Camera
from .exceptions import ImageGetRemoteImageRequestsError

logger = logging.getLogger(__name__)

# Create your models here.


class Image(models.Model):
    """Image model."""

    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True)
    part = models.ForeignKey(Part, on_delete=models.SET_NULL, null=True)
    camera = models.ForeignKey(Camera, on_delete=models.SET_NULL, null=True)
    image = models.ImageField(upload_to="images/")
    labels = models.CharField(max_length=1000, null=True)
    is_relabel = models.BooleanField(default=False)
    confidence = models.FloatField(default=0.0)
    uploaded = models.BooleanField(default=False)
    manual_checked = models.BooleanField(default=False)

    customvision_id = models.CharField(max_length=1000, null=True, blank=True)
    remote_url = models.CharField(max_length=1000, null=True)
    timestamp = models.DateTimeField(auto_now=True)

    def get_remote_image(self):
        """get_remote_image.

        Download image using remote url
        """
        try:
            resp = requests.get(self.remote_url)
        except Exception:
            raise ImageGetRemoteImageRequestsError(detail=("url: " + self.remote_url))
        if resp.status_code != status.HTTP_200_OK:
            raise ImageGetRemoteImageRequestsError(detail=("url: " + self.remote_url))
        bytes_io = BytesIO()
        bytes_io.write(resp.content)
        file_name = f"{self.part.name}-{self.remote_url.split('/')[-1]}"
        self.image.save(file_name, files.File(bytes_io))
        bytes_io.close()
        self.save()
        logger.info("Saving as name %s", file_name)

    def set_labels(self, left: float, top: float, width: float, height: float, tag_id: str):
        """set_labels.

        Args:
            left (float): left
            top (float): top
            width (float): width
            height (float): height
        """
        logger.info("Setting Image labels")
        if left > 1 or top > 1 or width > 1 or height > 1:
            logger.error("%s, %s, %s, %s must be less than 1", left, top, width, height)
            return
        if left < 0 or top < 0 or width < 0 or height < 0:
            logger.error(
                "%s, %s, %s, %s must be greater than 0", left, top, width, height
            )
            return
        if left + width > 1:
            logger.error("left + width: %s + %s must be less than 1", left, width)
            return
        if top + height > 1:
            logger.error("top + height: %s + %s must be less than 1", top, height)
            return

        with PILImage.open(self.image) as img:
            size_width, size_height = img.size
            logger.info("Setting labels. Image size %s", self.image)
            label_x1 = int(size_width * left)
            label_y1 = int(size_height * top)
            label_x2 = int(size_width * (left + width))
            label_y2 = int(size_height * (top + height))
            # to be modified to multi-labels
            if self.labels:
                if len(self.labels) > 0:
                    labels = json.loads(self.labels)
            else:
                labels = []
            labels.append({"x1": label_x1, "y1": label_y1,
                           "x2": label_x2, "y2": label_y2, "part": tag_id})
            self.labels = json.dumps(labels)
            self.save()
            logger.info("Set image labels success %s", self.labels)

    @staticmethod
    def pre_save(**kwargs):
        """pre_save.

        Args:
            instance:
            kwargs:
        """
        instance = kwargs["instance"]
        if instance.project is None and instance.part is not None:
            instance.project = instance.part.project
        if not instance.customvision_id:
            return


pre_save.connect(Image.pre_save, Image, dispatch_uid="Image_pre")
