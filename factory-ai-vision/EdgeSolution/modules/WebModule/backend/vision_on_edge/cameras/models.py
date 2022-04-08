"""App models.
"""

import logging

from django.db import models
from django.db.models.signals import pre_save

from ..locations.models import Location
from .constants import gen_default_lines, gen_default_zones
from .exceptions import CameraRtspInvalid
from .utils import verify_rtsp
from ..azure_app_insight.utils import get_app_insight_logger

logger = logging.getLogger(__name__)


class Camera(models.Model):
    """Camera Model."""

    name = models.CharField(max_length=200)
    rtsp = models.CharField(max_length=1000, blank=True)
    area = models.CharField(max_length=1000, blank=True)
    lines = models.CharField(max_length=1000, blank=True, default=gen_default_lines)
    danger_zones = models.CharField(
        max_length=1000, blank=True, default=gen_default_zones
    )
    is_demo = models.BooleanField(default=False)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)

    def tasks(self):
        try:
            return self.cameratasks.all()
        except Exception:
            return []

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name.__repr__()

    @staticmethod
    def pre_save(**kwargs):
        """pre_save."""
        instance = kwargs["instance"]
        if hasattr(instance, "skip_signals") and instance.skip_signals:
            return
        if instance.is_demo:
            return
        if instance.rtsp is None:
            raise CameraRtspInvalid
        if not verify_rtsp(rtsp=instance.rtsp):
            raise CameraRtspInvalid
        az_logger = get_app_insight_logger()
        properties = {
            "create_camera": {
                "name": instance.name,
                "rtsp_url": instance.rtsp,
                "location": instance.location.name,
                }
        }
        az_logger.warning(
            "camera",
            extra=properties,
        )


pre_save.connect(Camera.pre_save, Camera, dispatch_uid="Camera_pre")
