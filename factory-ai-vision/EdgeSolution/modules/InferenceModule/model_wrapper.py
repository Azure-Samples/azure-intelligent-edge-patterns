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

import onnxruntime
from onnxruntime_predict import ONNXRuntimeObjectDetection
from object_detection import ObjectDetection
from utility import get_file_zip, normalize_rtsp
from invoke import GraphManager

import logging


IMG_WIDTH = 960
IMG_HEIGHT = 540

GPU_MAX_FRAME_RATE = 30
CPU_MAX_FRAME_RATE = 15

class ONNXRuntimeModelDeploy(ObjectDetection):
    """Object Detection class for ONNX Runtime
    """

    def __init__(self, cam_type="video_file", model_dir='./default_model'):
        self.lock = threading.Lock()
        self.model = self.load_model(
            model_dir, is_default_model=True, is_scenario_model=False)
        self.model_uri = None

        self.image_shape = [IMG_HEIGHT, IMG_WIDTH]

        self.detection_mode = "PD"
        self.threshold = 0.3

        self.send_video_to_cloud = False

        # Part that we want to detect
        self.parts = []

        self.is_gpu = (onnxruntime.get_device() == 'GPU')


        if self.is_gpu:
            self.max_frame_rate = GPU_MAX_FRAME_RATE
        else:
            self.max_frame_rate = CPU_MAX_FRAME_RATE
        self.update_frame_rate_by_number_of_streams(1)


    def update_frame_rate_by_number_of_streams(self, number_of_streams):
        if number_of_streams > 0:
            self.frame_rate = max(1, int(self.max_frame_rate / number_of_streams))
            print('[INFO] set frame rate as', self.frame_rate, flush=True)
        else:
            print('[INFO] nothing change about frame rate since number of streams is 0', flush=True)
        return self.frame_rate

    def get_frame_rate(self):
        return self.frame_rate

    def update_parts(self, parts):
        print('[INFO] Updating Parts ...', parts)
        self.parts = parts

    def load_model(self, model_dir, is_default_model, is_scenario_model):
        if is_default_model:
            print('[INFO] Loading Default Model ...')

            model = None

            with open(model_dir + str('/cvexport.manifest')) as f:
                data = json.load(f)

            # FIXME to check whether we need to close the previous session
            if data['DomainType'] == 'ObjectDetection':
                model = ObjectDetection(data, model_dir, None)
                return model

        elif is_scenario_model:
            print('[INFO] Loading Default Model ...')
            with open(model_dir + '/labels.txt', 'r') as f:
                labels = [l.strip() for l in f.readlines()]
            model = ONNXRuntimeObjectDetection(
                model_dir + '/model.onnx', labels)

            return model

        else:
            print('[INFO] Loading Model ...')
            with open('model/labels.txt', 'r') as f:
                labels = [l.strip() for l in f.readlines()]
            model = ONNXRuntimeObjectDetection('model/model.onnx', labels)

            return model

        return None

    def update_model(self, model_dir):
        is_default_model = ('default_model' in model_dir)
        is_scenario_model = ('scenario_models' in model_dir)
        model = self.load_model(model_dir, is_default_model, is_scenario_model)

        # Protected by Mutex
        self.lock.acquire()
        self.model = model
        self.lock.release()

    def Score(self, image):

        self.lock.acquire()
        predictions, inf_time = self.model.predict_image(
            image)
        self.lock.release()

        return predictions, inf_time


# def update_instance(rtspUrl, instance_id):
#    payload = {
#        "@apiVersion": "1.0",
#        "name": instance_id
#    }
#    payload_set = {
#        "@apiVersion": "1.0",
#        "name": instance_id,
#        "properties": {
#            "topologyName": "InferencingWithGrpcExtension",
#            "description": "Sample graph description",
#            "parameters": [
#                {"name": "rtspUrl", "value": rtspUrl},
#                {"name": "grpcExtensionAddress",
#                    "value": "tcp://InferenceModule:44000"},
#                {"name": "frameHeight", "value": "540"},
#                {"name": "frameWidth", "value": "960"},
#            ]
#        }
#    }
#    manager = GraphManager()
#
#    res_dea = manager.invoke_method("GraphInstanceDeactivate", payload)
#    res_set = manager.invoke_method("GraphInstanceSet", payload_set)
#    res_act = manager.invoke_method("GraphInstanceActivate", payload)
#    print("instance updated")
