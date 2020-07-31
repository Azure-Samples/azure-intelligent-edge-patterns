"""
Models for Azure CustomVision images
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

from vision_on_edge.azure_training.models import Project

from ..azure_parts.models import Part

logger = logging.getLogger(__name__)

# Create your models here.


class Image(models.Model):
    """Image.

    models.Model
    """

    image = models.ImageField(upload_to="images/")
    part = models.ForeignKey(Part, on_delete=models.CASCADE)
    labels = models.CharField(max_length=1000, null=True)
    is_relabel = models.BooleanField(default=False)
    confidence = models.FloatField(default=0.0)
    uploaded = models.BooleanField(default=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True)
    customvision_id = models.CharField(max_length=1000, null=True, blank=True)
    remote_url = models.CharField(max_length=1000, null=True)

    def get_remote_image(self):
        """get_remote_image.

        Download image using remote url
        """

        try:
            if self.remote_url:
                resp = requests.get(self.remote_url)
                if resp.status_code != status.HTTP_200_OK:
                    raise requests.exceptions.RequestException
                bytes_io = BytesIO()
                bytes_io.write(resp.content)
                file_name = f"{self.part.name}-{self.remote_url.split('/')[-1]}"
                logger.info("Saving as name %s", file_name)

                self.image.save(file_name, files.File(bytes_io))
                bytes_io.close()
                self.save()
        except requests.exceptions.RequestException as request_err:
            # Probably wrong url
            raise request_err
        except Exception as unexpected_error:
            logger.exception("unexpected error")
            raise unexpected_error

    def set_labels(self, left: float, top: float, width: float, height: float):
        """set_labels.

        Args:
            left (float): left
            top (float): top
            width (float): width
            height (float): height
        """
        try:
            if left > 1 or top > 1 or width > 1 or height > 1:
                raise ValueError(
                    f"{left}, {top}, {width}, {height} must be less than 1")
            if left < 0 or top < 0 or width < 0 or height < 0:
                # raise ValueError(
                # f"{left}, {top}, {width}, {height} must be greater than 0")
                logger.error("%s, %s, %s, %s must be greater than 0", left,
                             top, width, height)
                return
            if left + width > 1:
                logger.error("left + width: %s + %s must be less than 1", left,
                             width)
                return
            if top + height > 1:
                logger.error("top + height: %s + %s must be less than 1", top,
                             height)
                return

            with PILImage.open(self.image) as img:
                logger.info("Successfully open img %s", self.image)
                size_width, size_height = img.size
                label_x1 = int(size_width * left)
                label_y1 = int(size_height * top)
                label_x2 = int(size_width * (left + width))
                label_y2 = int(size_height * (top + height))
                self.labels = json.dumps([{
                    "x1": label_x1,
                    "y1": label_y1,
                    "x2": label_x2,
                    "y2": label_y2
                }])
                self.save()
                logger.info("Successfully save labels to %s", self.labels)
        except ValueError as value_err:
            raise value_err
        except Exception as uncaught_err:
            logger.exception("Set label raise unexpected error")
            raise uncaught_err

    def add_labels(self, left: float, top: float, width: float, height: float):
        """add_labels.

        Args:
            left (float): left
            top (float): top
            width (float): width
            height (float): height
        """
        try:
            if left > 1 or top > 1 or width > 1 or height > 1:
                raise ValueError("%s, %s, %s, %s must be less than 1" %
                                 (left, top, width, height))
            if left < 0 or top < 0 or width < 0 or height < 0:
                raise ValueError("%s, %s, %s, %s must be greater than 0" %
                                 (left, top, width, height))
            if left + width > 1:
                raise ValueError("left + width: %s + %s must be less than 1" %
                                 (left, width))
            if top + height > 1:
                raise ValueError("top + height: %s + %s  must be less than 1" %
                                 (top, height))
        except ValueError as value_err:
            raise value_err

    @staticmethod
    def pre_save(instance, **kwargs):
        """pre_save.

        Args:
            instance:
            kwargs:
        """

        if 'instance' not in kwargs:
            return
        instance = kwargs['instance']
        if not instance.customvision_id:
            return


pre_save.connect(Image.pre_save, Image, dispatch_uid="Image_pre")
