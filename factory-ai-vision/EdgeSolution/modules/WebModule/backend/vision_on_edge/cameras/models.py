"""
Camera models
"""
import logging
import sys
import threading
import time

import cv2
import requests
from azure.iot.device import IoTHubModuleClient
from django.db import models
from django.db.models.signals import post_save, pre_save
from django.db.utils import IntegrityError

logger = logging.getLogger(__name__)


def is_edge():
    """Determine is edge or not. Return bool"""
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except:
        return False


def inference_module_url():
    """Return Inference URL"""
    if is_edge():
        return "172.18.0.1:5000"
    return "localhost:5000"


# Create your models here.



class Camera(models.Model):
    """Camera Model"""

    name = models.CharField(max_length=200)
    rtsp = models.CharField(max_length=1000)
    area = models.CharField(max_length=1000, blank=True)
    is_demo = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    @staticmethod
    def verify_rtsp(rtsp):
        """ Return True if the rtsp is ok, otherwise return False """
        logger.info("Camera static method: verify_rtsp")
        logger.info(rtsp)
        if rtsp == '0':
            rtsp = 0
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
    def pre_save(instance, update_fields, **kwargs):
        """Camera pre_save"""
        if instance.is_demo:
            return
        if instance.rtsp is None:
            raise ValueError('rtsp is none')
        rtsp_ok = Camera.verify_rtsp(rtsp=instance.rtsp)
        if not rtsp_ok:
            raise ValueError('rtsp is not valid')

    @staticmethod
    def post_save(instance, update_fields, **kwargs):
        """Camera post_save"""
        if len(instance.area) > 1:
            logger.info("Sending new AOI to Inference Module...")
            try:
                requests.get(
                    url="http://" + inference_module_url() + "/update_cam",
                    params={
                        "cam_type": "rtsp",
                        "cam_source": instance.rtsp,
                        "aoi": instance.area,
                    },
                )
            except:
                logger.error("Request failed")



pre_save.connect(Camera.pre_save, Camera, dispatch_uid="Camera_pre")
post_save.connect(Camera.post_save, Camera, dispatch_uid="Camera_post")
