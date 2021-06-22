"""
Camera models
"""
import json
import logging
# import queue
# import random
import sys
import threading
import time
from io import BytesIO

import cv2
import requests
from azure.iot.device import IoTHubModuleClient
from django.core import files
from django.db import models
from django.db.models.signals import post_save, pre_save
from django.db.utils import IntegrityError
from PIL import Image as PILImage
from rest_framework import status

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


class Part(models.Model):
    """Part Model"""

    name = models.CharField(max_length=200)
    description = models.CharField(max_length=1000, blank=True, default="")
    is_demo = models.BooleanField(default=False)
    name_lower = models.CharField(max_length=200, default=str(name).lower())

    class Meta:
        unique_together = ("name_lower", "is_demo")

    def __str__(self):
        return self.name

    @staticmethod
    def pre_save(instance, update_fields, **kwargs):
        """Part pre_save"""
        try:
            update_fields = []
            instance.name_lower = str(instance.name).lower()
            update_fields.append("name_lower")
        except IntegrityError as integrity_error:
            logger.error(integrity_error)
            raise integrity_error
        except:
            logger.exception("Unexpected Error in Part Presave")


class Image(models.Model):
    """Image Model"""

    image = models.ImageField(upload_to="images/")
    part = models.ForeignKey(Part, on_delete=models.CASCADE)
    labels = models.CharField(max_length=1000, null=True)
    is_relabel = models.BooleanField(default=False)
    confidence = models.FloatField(default=0.0)
    uploaded = models.BooleanField(default=False)
    remote_url = models.CharField(max_length=1000, null=True)

    def get_remote_image(self):
        """Download image using remote url"""
        try:
            if self.remote_url:
                resp = requests.get(self.remote_url)
                if resp.status_code != status.HTTP_200_OK:
                    raise requests.exceptions.RequestException
                fp = BytesIO()
                fp.write(resp.content)
                file_name = f"{self.part.name}-{self.remote_url.split('/')[-1]}"
                logger.info("Saving as name %s", file_name)

                self.image.save(file_name, files.File(fp))
                fp.close()
                self.save()
        except requests.exceptions.RequestException as request_err:
            # Probably wrong url
            raise request_err
        except Exception as unexpected_error:
            logger.exception("unexpected error")
            raise unexpected_error

    def set_labels(self, left: float, top: float, width: float, height: float):
        "Set label to image"
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
            elif left + width > 1:
                logger.error("left + width: %s + %s must be less than 1", left,
                             width)
                return
            elif top + height > 1:
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
        "Add Labels to Image"
        try:
            if left > 1 or top > 1 or width > 1 or height > 1:
                raise ValueError("%s, %s, %s, %s must be less than 1", left,
                                 top, width, height)
            if left < 0 or top < 0 or width < 0 or height < 0:
                raise ValueError("%s, %s, %s, %s must be greater than 0", left,
                                 top, width, height)
            if left + width > 1:
                raise ValueError("left + width: %s + %s must be less than 1",
                                 left, width)
            if top + height > 1:
                raise ValueError("top + height: %s + %s  must be less than 1",
                                 top, height)
        except ValueError as value_err:
            raise value_err


class Annotation(models.Model):
    """Annotation Model"""

    image = models.OneToOneField(Image, on_delete=models.CASCADE)
    labels = models.CharField(max_length=1000, null=True)


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


# FIXME consider move this out of models.py
class Stream(object):
    """Stream Class"""

    def __init__(self, rtsp, part_id=None, inference=False):
        if rtsp == "0":
            self.rtsp = 0
        elif rtsp == "1":
            self.rtsp = 1
        else:
            self.rtsp = rtsp
        self.part_id = part_id

        self.last_active = time.time()
        self.status = "init"
        self.last_img = None
        self.cur_img_index = 0
        self.last_get_img_index = 0
        self.id = id(self)

        self.mutex = threading.Lock()
        self.predictions = []
        self.inference = inference
        self.iot = None
        try:
            self.iot = IoTHubModuleClient.create_from_edge_environment()
        except KeyError as key_error:
            logger.error(key_error)
        except OSError as os_error:
            logger.error(os_error)
        except Exception:
            logger.exception("Unexpected error")

        logger.info("inference %s", self.inference)
        logger.info("iot %s", self.iot)

        def _listener(self):
            if not self.inference:
                return
            while True:
                if self.last_active + 10 < time.time():
                    print("[INFO] stream finished")
                    break
                sys.stdout.flush()
                res = requests.get("http://" + inference_module_url() +
                                   "/prediction")

                self.mutex.acquire()
                self.predictions = res.json()
                self.mutex.release()
                time.sleep(0.02)
                # print('received p', self.predictions)

                # inference = self.iot.receive_message_on_input('inference',
                #                                               timeout=1)
                # if not inference:
                #    self.mutex.acquire()
                #    self.bboxes = []
                #    self.mutex.release()
                # else:
                #    data = json.loads(inference.data)
                #    print('receive inference', data)
                #    self.mutex.acquire()
                #    self.bboxes = [{
                #        'label': data['Label'],
                #        'confidence': data['Confidence'] + '%',
                #        'p1': (data['Position'][0], data['Position'][1]),
                #        'p2': (data['Position'][2], data['Position'][3])
                #    }]
                #    self.mutex.release()

        # if self.iot:
        threading.Thread(target=_listener, args=(self,)).start()

    def gen(self):
        """generator for stream"""
        self.status = "running"
        logger.info(f"start streaming with {self.rtsp}")
        self.cap = cv2.VideoCapture(self.rtsp)
        while self.status == "running":
            if not self.cap.isOpened():
                raise ValueError("Cannot connect to rtsp")
            t, img = self.cap.read()
            # Need to add the video flag FIXME
            if t == False:
                self.cap = cv2.VideoCapture(self.rtsp)
                time.sleep(1)
                continue

            img = cv2.resize(img, None, fx=0.5, fy=0.5)
            self.last_active = time.time()
            self.last_img = img.copy()
            self.cur_img_index = (self.cur_img_index + 1) % 10000
            self.mutex.acquire()
            predictions = list(
                prediction.copy() for prediction in self.predictions)
            self.mutex.release()

            # print('bboxes', bboxes)
            # cv2.rectangle(img, bbox['p1'], bbox['p2'], (0, 0, 255), 3)
            # cv2.putText(img, bbox['label'] + ' ' + bbox['confidence'],
            # (bbox['p1'][0], bbox['p1'][1]-15),
            # cv2.FONT_HERSHEY_COMPLEX,
            # 0.6,
            # (0, 0, 255),
            # 1)
            height, width = img.shape[0], img.shape[1]
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 1
            thickness = 3
            for prediction in predictions:
                if prediction["probability"] > 0.25:
                    x1 = int(prediction["boundingBox"]["left"] * width)
                    y1 = int(prediction["boundingBox"]["top"] * height)
                    x2 = x1 + int(prediction["boundingBox"]["width"] * width)
                    y2 = y1 + int(prediction["boundingBox"]["height"] * height)
                    img = cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255),
                                        2)
                    img = cv2.putText(
                        img,
                        prediction["tagName"],
                        (x1 + 10, y1 + 30),
                        font,
                        font_scale,
                        (0, 0, 255),
                        thickness,
                    )
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" +
                   cv2.imencode(".jpg", img)[1].tobytes() + b"\r\n")
        self.cap.release()

    def get_frame(self):
        """Get frame"""
        print("[INFO] get frame", self)
        # b, img = self.cap.read()
        time_begin = time.time()
        while True:
            if time.time() - time_begin > 5:
                break
            if self.last_get_img_index == self.cur_img_index:
                time.sleep(0.01)
            else:
                break
        self.last_get_img_index = self.cur_img_index
        img = self.last_img.copy()
        # if b: return cv2.imencode('.jpg', img)[1].tobytes()
        # else : return None
        return cv2.imencode(".jpg", img)[1].tobytes()

    def close(self):
        """close stream"""
        self.status = "stopped"
        logger.info("release %s", self)


pre_save.connect(Camera.pre_save, Camera, dispatch_uid="Camera_pre")
post_save.connect(Camera.post_save, Camera, dispatch_uid="Camera_post")
pre_save.connect(Part.pre_save, Part, dispatch_uid="Part_pre")
