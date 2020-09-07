# -*- coding: utf-8 -*-
"""App signals.
"""

import logging

from django.db.models.signals import pre_save, m2m_changed, post_save
from django.dispatch import receiver

from .models import PartDetection
from ..cameras.models import Camera

logger = logging.getLogger(__name__)


@receiver(signal=pre_save,
          sender=PartDetection,
          dispatch_uid="azure_part_detection_has_configured_handler")
def azure_part_detection_has_configured_handler(**kwargs):
    """Project is_configured handler

    For now, only one project can have is configured = True
    """

    instance = kwargs['instance']
    logger.info("Changing has_configured")
    if instance.has_configured:
        for other_pd in PartDetection.objects.exclude(id=instance.id):
            other_pd.has_configured = False
            other_pd.save()
    logger.info("Signal end")

@receiver(signal=m2m_changed,
          sender=PartDetection.cameras.through,
          dispatch_uid="azure_part_detection_camera_m2m_change")
def azure_part_detection_camera_m2m_change(**kwargs):
    """azure_part_detection_camera_m2m_change.

    Args:
        kwargs:
    """
    instance = kwargs["instance"]

@receiver(signal=pre_save,
          sender=Camera,
          dispatch_uid="azure_part_detection_camera_rtsp_change")
def azure_part_detection_camera_rtsp_change(**kwargs):
    """azure_part_detection_camera_m2m_change.

    Args:
        kwargs:
    """
    instance = kwargs["instance"]
    part_detection_objs = PartDetection.objects.filter(cameras=instance)
    for part_detection_obj in part_detection_objs:
        part_detection_objs.update_cam()
