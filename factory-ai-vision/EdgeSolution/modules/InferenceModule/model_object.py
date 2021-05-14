import json
import logging
import os
import threading
import time

import requests
import socket
from utility import is_edge


IMG_WIDTH = 960
IMG_HEIGHT = 540

GPU_MAX_FRAME_RATE = 30
CPU_MAX_FRAME_RATE = 10

LVA_MODE = os.environ.get("LVA_MODE", "grpc")

logger = logging.getLogger(__name__)


class ModelObject():

    def __init__(self):
        self.lock = threading.Lock()
        # self.model = self.load_model(
        #    model_dir, is_default_model=True, is_scenario_model=False
        # )
        self.model = None
        self.model_uri = None
        self.model_downloading = False
        self.lva_mode = LVA_MODE
        self.endpoint = 'http://predictmodule:7777/predict'
        self.headers = None

        self.image_shape = [IMG_HEIGHT, IMG_WIDTH]

        self.is_scenario = False
        self.detection_mode = "PD"
        self.threshold = 0.3

        self.send_video_to_cloud = False

        # Part that we want to detect
        self.parts = []

        self.scenario_gps = {}

        # self.is_gpu = onnxruntime.get_device() == "GPU"
        self.is_gpu = self.get_device() == "gpu"

        if self.is_gpu:
            self.max_total_frame_rate = GPU_MAX_FRAME_RATE
        else:
            self.max_total_frame_rate = CPU_MAX_FRAME_RATE
        self.update_frame_rate_by_number_of_streams(1)

    @property
    def is_vpu(self):
        return self.get_device() == 'vpu'

    def get_device(self):
        while True:
            try:
                response = requests.get(
                    "http://" + predict_module_url() + "/get_device")
                device = response.json()["device"]
                if device == 'CPU-OPENVINO_MYRIAD':
                    device = 'vpu'
                break
            except:
                time.sleep(2)
                continue
        # device = onnxruntime.get_device()
        # if device == 'CPU-OPENVINO_MYRIAD':
        #     device = 'vpu'
        return device.lower()

    def set_is_scenario(self, is_scenario):
        self.is_scenario = is_scenario

    def set_detection_mode(self, mode):
        self.detection_mode = mode

    def get_detection_mode(self):
        if self.is_scenario == False:
            return "PD"
        else:
            return self.detection_mode

    def set_max_total_frame_rate(self, fps):
        self.max_total_frame_rate = fps
        print("[INFO] set max total frame rate as", fps, flush=True)

    def update_frame_rate_by_number_of_streams(self, number_of_streams):
        if number_of_streams > 0:
            self.frame_rate = max(
                1, int(self.max_total_frame_rate / number_of_streams))
            print("[INFO] set frame rate as", self.frame_rate, flush=True)
        else:
            print(
                "[INFO] nothing change about frame rate since number of streams is 0",
                flush=True,
            )
        return self.frame_rate

    def get_recommended_frame_rate(self, number_of_streams):
        if number_of_streams > 0:
            return max(1, int(self.max_total_frame_rate / number_of_streams))
        else:
            return self.max_total_frame_rate

    def get_recommended_total_frame_rate(self):
        return self.max_total_frame_rate

    def get_scenario_frame_rate(self):
        if self.detection_mode in self.scenario_gps.keys():
            return self.scenario_gps[self.detection_mode]
        else:
            return 0.0

    def set_frame_rate(self, frame_rate):
        self.frame_rate = frame_rate
        self.scenario_gps[self.detection_mode] = frame_rate

    def get_frame_rate(self):
        return self.frame_rate

    def set_lva_mode(self, lva_mode):
        self.lva_mode = lva_mode

    def update_parts(self, parts):
        logger.info("Updating Parts ... %s", parts)
        self.parts = parts


def predict_module_url():
    if is_edge():
        ip = socket.gethostbyname("predictmodule")
        return ip + ":7777"
        # return "PredictModule:7777"
    else:
        return "localhost:7777"
