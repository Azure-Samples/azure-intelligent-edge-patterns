"""App signals.
"""

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from ..cameras.models import Camera
from .models import CameraTask

logger = logging.getLogger(__name__)


@receiver(
    signal=post_save,
    sender=Camera,
    dispatch_uid="create_task_upon_camera_create",
)
def create_task_upon_camera_create(**kwargs):
    """create_task_upon_camera_create.

    Args:
        kwargs:
    """

    instance = kwargs["instance"]
    created = kwargs["created"]
    if not created:
        logger.info("Camera not created. Pass...")
        return

    logger.info("Camera created. Create CameraTask object.")
    CameraTask.objects.update_or_create(
        camera_id=instance.id,
    )
