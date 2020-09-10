import os
import threading
import cv2
import json
import time
import requests
import numpy as np
import onnxruntime

from shapely.geometry import Polygon
from exception_handler import PrintGetExceptionDetails
from azure.iot.device import IoTHubModuleClient

import onnxruntime
from onnxruntime_predict import ONNXRuntimeObjectDetection
from object_detection import ObjectDetection
from utility import get_file_zip, normalize_rtsp
from invoke import gm

import logging


class Stream():
    def __init__(self, cam_id, model, sender, cam_type="video_file", cam_source='./sample_video/video.mp4'):
        self.cam_id = cam_id
        self.model = model

        self.render = False

        self.lock = threading.Lock()

        self.cam_type = cam_type
        self.cam_source = None
        self.cam = cv2.VideoCapture(normalize_rtsp(cam_source))
        self.cam_is_alive = True

        self.IMG_WIDTH = 960
        self.IMG_HEIGHT = 540
        self.image_shape = [540, 960]

        self.last_img = None
        self.last_edge_img = None
        self.last_drawn_img = None
        self.last_prediction = []
        self.last_prediction_count = {}

        self.confidence_min = 30 * 0.01
        self.confidence_max = 30 * 0.01
        self.max_images = 10
        self.last_upload_time = 0
        self.is_upload_image = False
        self.current_uploaded_images = {}

        self.detection_success_num = 0
        self.detection_unidentified_num = 0
        self.detection_total = 0
        self.detections = []

        self.threshold = 0.3

        self.has_aoi = False
        self.aoi_info = None
        # Part that we want to detect
        self.parts = []

        # self.is_gpu = (onnxruntime.get_device() == 'GPU')
        self.average_inference_time = 0

        # IoT Hub
        self.iothub_is_send = False
        self.iothub_threshold = 0.5
        self.iothub_fpm = 0
        self.iothub_last_send_time = time.time()
        self.iothub_interval = 99999999

        self.zmq_sender = sender
        self.start_zmq()

    def _stop(self):
        gm.invoke_graph_instance_deactivate(self.cam_id)

    def _set(self, rtspUrl):
        gm.invoke_graph_grpc_instance_set(self.cam_id, rtspUrl)

    def _start(self):
        gm.invoke_graph_instance_activate(self.cam_id)

    def start_zmq(self):
        def run(self):
            # logging.info('running zmq')
            # context = zmq.Context()
            # sender = context.socket(zmq.PUB)
            # sender.bind("tcp://*:5558")

            while 'flags' not in dir(self.last_drawn_img):
                logging.info('not sending last_drawn_img')
                time.sleep(2)
            cnt = 0
            while self.cam_is_alive:
                cnt += 1
                if cnt % 30 == 1:
                    logging.info('send through channel {0}'.format(
                        bytes(self.cam_id, 'utf-8')))
                    self.lock.acquire()
                    self.zmq_sender.send_multipart([bytes(
                        self.cam_id, 'utf-8'), cv2.imencode(".jpg", self.last_drawn_img)[1].tobytes()])
                    self.lock.release()
                    # sender.send_pyobj(
                    #     {"data": cv2.imencode(".jpg", self._tYoloV3.last_drawn_img)[1].tobytes(), "ts": str(cnt), "shape": (540, 960, 3)})
                    # sender.send(cv2.imencode(".jpg", onnx.last_img)[1].tostring())
                    # time.sleep(2)
                    time.sleep(0.04)
        threading.Thread(target=run, args=(self,)).start()

    def restart_cam(self):

        print('[INFO] Restarting Cam')

        cam = cv2.VideoCapture(normalize_rtsp(self.cam_source))

        # Protected by Mutex
        self.lock.acquire()
        self.cam.release()
        self.cam = cam
        self.lock.release()

    def update_cam(self, cam_type, cam_source, cam_id, has_aoi, aoi_info):
        print('[INFO] Updating Cam ...')
        #print('  cam_type', cam_type)
        #print('  cam_source', cam_source)

        if cam_source == '0':
            cam_source = 0
        elif cam_source == '1':
            cam_source = 1
        elif cam_source == '2':
            cam_source = 2
        elif cam_source == '3':
            cam_source = 3

        if self.cam_type == cam_type and self.cam_source == cam_source:
            return

        self.cam_source = cam_source
        self.has_aoi = has_aoi
        self.aoi_info = aoi_info
        cam = cv2.VideoCapture(normalize_rtsp(cam_source))

        # Protected by Mutex
        self.lock.acquire()
        self.cam.release()
        self.cam = cam
        self.lock.release()

        self._update_instance(normalize_rtsp(cam_source))

    def _update_instance(self, rtspUrl):
        self._stop()
        self._set(rtspUrl)
        self._start()
        logging.info("Instance {0} updated, rtsp = {1}".format(
            self.cam_id, rtspUrl))

    def update_retrain_parameters(self, confidence_min, confidence_max, max_images):
        self.confidence_min = confidence_min * 0.01
        self.confidence_max = confidence_max * 0.01
        self.max_images = max_images
        self.threshold = self.confidence_max

    def update_iothub_parameters(self, is_send, threshold, fpm):
        self.iothub_is_send = is_send
        self.iothub_threshold = threshold
        self.iothub_fpm = fpm
        self.iothub_last_send_time = time.time()
        if fpm == 0:
            self.iothub_is_send = 0
            self.iothub_interval = 99999999
        else:
            self.iothub_interval = 60 / fpm  # seconds

    def delete(self):
        self.lock.acquire()
        self.cam_is_alive = False
        self.lock.release()

        gm.invoke_graph_instance_deactivate(self.cam_id)
        logging.info('Deactivate stream {0}'.format(self.cam_id))

    def predict(self, image):

        width = self.IMG_WIDTH
        ratio = self.IMG_WIDTH / image.shape[1]
        height = int(image.shape[0] * ratio + 0.000001)
        if height >= self.IMG_HEIGHT:
            height = self.IMG_HEIGHT
            ratio = self.IMG_HEIGHT / image.shape[0]
            width = int(image.shape[1] * ratio + 0.000001)

        image = cv2.resize(image, (width, height))

        self.lock.acquire()
        predictions, inf_time = self.model.Score(image)
        self.lock.release()

        self.last_img = image
        self.last_prediction = predictions

        self.draw_img()

        inf_time_ms = inf_time * 1000
        self.average_inference_time = 1/16*inf_time_ms + 15/16*self.average_inference_time

    def draw_img(self):
        # logging.info('draw_img')

        while 'flags' not in dir(self.last_img):
            print('no last_img')
            time.sleep(1)

        img = self.last_img.copy()

        height, width = img.shape[0], img.shape[1]
        predictions = self.last_prediction
        for prediction in predictions:
            tag = prediction['tagName']
            if tag not in self.model.parts:
                continue

            if self.has_aoi:
                #     # for aoi_area in onnx.aoi_info:
                #     # img = cv2.rectangle(img, (int(aoi_area['x1']), int(aoi_area['y1'])), (int(
                #     #    aoi_area['x2']), int(aoi_area['y2'])), (0, 255, 255), 2)
                draw_aoi(img, self.aoi_info)

            if prediction['probability'] > self.threshold:
                (x1, y1), (x2, y2) = parse_bbox(
                    prediction, width, height)
                if self.has_aoi:
                    if not is_inside_aoi(x1, y1, x2, y2, self.aoi_info):
                        continue

                img = cv2.rectangle(
                    img, (x1, y1), (x2, y2), (0, 0, 255), 2)
                img = draw_confidence_level(img, prediction)
        self.last_drawn_img = img


def is_edge():
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except:
        return False


try:
    iot = IoTHubModuleClient.create_from_edge_environment()
except:
    iot = None


def web_module_url():
    if is_edge():
        return '172.18.0.1:8080'
    else:
        return 'localhost:8000'


def draw_aoi(img, aoi_info):
    for aoi_area in aoi_info:
        aoi_type = aoi_area['type']
        label = aoi_area['label']

        if aoi_type == 'BBox':
            cv2.rectangle(img,
                          (int(label['x1']), int(label['y1'])),
                          (int(label['x2']), int(label['y2'])), (0, 255, 255), 2)

        elif aoi_area['type'] == 'Polygon':
            l = len(label)
            for index, point in enumerate(label):
                p1 = (point['x'], point['y'])
                p2 = (label[(index+1) % l]['x'], label[(index+1) % l]['y'])
                cv2.line(img, p1, p2, (0, 255, 255), 2)

    return


def is_inside_aoi(x1, y1, x2, y2, aoi_info):

    obj_shape = Polygon([[x1, y1], [x2, y1], [x2, y2], [x1, y2]])

    for aoi_area in aoi_info:
        aoi_type = aoi_area['type']
        label = aoi_area['label']

        if aoi_area['type'] == 'BBox':
            if ((label['x1'] <= x1 <= label['x2']) or (label['x1'] <= x2 <= label['x2'])) and \
                    ((label['y1'] <= y1 <= label['y2']) or (label['y1'] <= y2 <= label['y2'])):
                return True

        elif aoi_area['type'] == 'Polygon':
            points = []
            for point in label:
                points.append([point['x'], point['y']])
            aoi_shape = Polygon(points)
            if aoi_shape.is_valid and aoi_shape.intersects(obj_shape):
                return True

    return False


def parse_bbox(prediction, width, height):
    x1 = int(prediction['boundingBox']['left'] * width)
    y1 = int(prediction['boundingBox']['top'] * height)
    x2 = x1 + int(prediction['boundingBox']['width'] * width)
    y2 = y1 + int(prediction['boundingBox']['height'] * height)
    x1 = min(max(x1, 0), width-1)
    x2 = min(max(x2, 0), width-1)
    y1 = min(max(y1, 0), height-1)
    y2 = min(max(y2, 0), height-1)
    return (x1, y1), (x2, y2)


def draw_confidence_level(img, prediction):
    height, width = img.shape[0], img.shape[1]

    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.7
    thickness = 2

    prob_str = str(int(prediction['probability']*1000)/10)
    prob_str = ' (' + prob_str + '%)'

    (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)

    img = cv2.putText(img, prediction['tagName']+prob_str,
                      (x1+10, y1+20), font, font_scale, (20, 20, 255), thickness)

    return img
