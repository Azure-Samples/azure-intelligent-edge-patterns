"""App models.
"""

import logging

from django.db import models
from django.db.models.signals import pre_save
from rest_framework.exceptions import APIException

from ..azure_projects.models import Project
from .constants import OBJECTDETECTION_LEAST_IMAGE_TO_TRAIN, CASSIFICATION_LEAST_IMAGE_TO_TRAIN
from .exceptions import PartNotEnoughImagesToTrain

logger = logging.getLogger(__name__)
CUSTOMVISION_LEAST_IMAGE_TO_TRAIN = 15

class Part(models.Model):
    """Part Model"""

    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=1000, blank=True, default="")
    name_lower = models.CharField(max_length=200, default=str(name).lower())
    customvision_id = models.CharField(max_length=200, blank=True, default="")
    customvision_type = models.CharField(max_length=20, blank=True, default="Regular")

    class Meta:
        unique_together = ("name_lower", "project")

    def is_trainable(self, raise_exception: bool = False) -> bool:
        """is_trainable.

        Args:
            raise_exception (bool): raise_exception

        Returns:
            bool: if part has enough images and is trainable.
        """
        try:
            if self.project.type == 'ObjectDetection':
                CUSTOMVISION_LEAST_IMAGE_TO_TRAIN = OBJECTDETECTION_LEAST_IMAGE_TO_TRAIN
            else:
                CUSTOMVISION_LEAST_IMAGE_TO_TRAIN = CASSIFICATION_LEAST_IMAGE_TO_TRAIN

            if self.project.is_demo:
                return True
            local_count = self.get_tagged_images_count_local()
            remote_count = self.get_tagged_images_count_remote()
            if local_count + remote_count >= CUSTOMVISION_LEAST_IMAGE_TO_TRAIN:
                return True
            raise PartNotEnoughImagesToTrain(
                detail=(
                    f"{self.name} image count local: {local_count} remote {remote_count}"
                    + f"(expected least total: {CUSTOMVISION_LEAST_IMAGE_TO_TRAIN})"
                )
            )
        except APIException:
            if raise_exception:
                raise
            return False

    def get_tagged_images_count_local(self) -> int:
        """get_tagged_images_count_local.

        Args:

        Returns:
            int:
        """
        from ..images.models import Image
        try:
            # return self.image_set.filter(uploaded=False, manual_checked=True).count()
            return Image.objects.filter(uploaded=False, part_ids__contains='"{}"'.format(str(self.id)), manual_checked=True).count()
        except AttributeError:
            return 0

    def get_tagged_images_count_remote(self) -> int:
        """get_tagged_images_count.

        Returns:
            int: Tagged images count on Custom Vision
        """
        if self.project.is_demo:
            return CUSTOMVISION_LEAST_IMAGE_TO_TRAIN
        if not self.project.customvision_id:
            return 0
        if not self.customvision_id:
            return 0
        trainer = self.project.get_trainer_obj()
        return trainer.get_tagged_image_count(
            project_id=self.project.customvision_id, tag_ids=[self.customvision_id]
        )

    def __str__(self):
        return self.name

    @staticmethod
    def pre_save(**kwargs):
        """pre_save."""
        instance = kwargs["instance"]
        instance.name_lower = str(instance.name).lower()


pre_save.connect(Part.pre_save, Part, dispatch_uid="Part_pre")
