# -*- coding: utf-8 -*-
"""App models.
"""

import logging

import cv2
import requests
from django.db import models
from django.db.models.signals import post_save, pre_save

from vision_on_edge.general.utils import normalize_rtsp

from ..azure_iot.utils import inference_module_url
from ..locations.models import Location

logger = logging.getLogger(__name__)


class Camera(models.Model):
    """Camera Model.
    """

    name = models.CharField(max_length=200)
    rtsp = models.CharField(max_length=1000)
    area = models.CharField(max_length=1000, blank=True)
    is_demo = models.BooleanField(default=False)
    location = models.ForeignKey(Location,
                                 on_delete=models.SET_NULL,
                                 null=True)

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

    @staticmethod
    def verify_rtsp(rtsp):
        """Validate a rtsp.
        Args:
            rtsp (str)

        Returns:
            is_rtsp_valid (bool)
        """

        logger.info("Camera static method: verify_rtsp")
        logger.info(rtsp)
        if rtsp == '0':
            rtsp = 0
        elif isinstance(rtsp, str) and rtsp.lower().find("rtsp") == 0:
            logger.error("This is a rtsp")
            rtsp = "rtsp" + rtsp[4:]
        cap = cv2.VideoCapture(rtsp)
        if not cap.isOpened():
            cap.release()
            return False
        is_ok, _ = cap.read()
        if not is_ok:
            cap.release()
            return False
        cap.release()
        return True

    @staticmethod
    def pre_save(**kwargs):
        """pre_save.
        """
        instance = kwargs['instance']
        if instance.is_demo:
            return
        if instance.rtsp is None:
            raise ValueError('rtsp is none')
        rtsp_ok = Camera.verify_rtsp(rtsp=instance.rtsp)
        if not rtsp_ok:
            raise ValueError('rtsp is not valid')

pre_save.connect(Camera.pre_save, Camera, dispatch_uid="Camera_pre")
