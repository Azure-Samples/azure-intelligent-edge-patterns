"""Model Wrapper
"""

import json
import logging
import os
import threading
import time
import traceback

import cv2
import numpy as np
import onnxruntime
import requests
from shapely.geometry import Polygon

from exception_handler import PrintGetExceptionDetails
from object_detection import ObjectDetection
from onnxruntime_predict import ONNXRuntimeObjectDetection
from utility import get_file_zip, normalize_rtsp

IMG_WIDTH = 960
IMG_HEIGHT = 540

GPU_MAX_FRAME_RATE = 30
CPU_MAX_FRAME_RATE = 10

LVA_MODE = os.environ.get("LVA_MODE", "grpc")

logger = logging.getLogger(__name__)


class ONNXRuntimeModelDeploy(ObjectDetection):
    """Object Detection class for ONNX Runtime
    """

    def __init__(self, cam_type="video_file", model_dir="./default_model"):
        self.lock = threading.Lock()
        self.model = self.load_model(
            model_dir, is_default_model=True, is_scenario_model=False
        )
        self.model_uri = None
        self.model_downloading = False
        self.lva_mode = LVA_MODE

        self.image_shape = [IMG_HEIGHT, IMG_WIDTH]

        self.is_scenario = False
        self.detection_mode = "PD"
        self.threshold = 0.3

        self.send_video_to_cloud = False

        # Part that we want to detect
        self.parts = []

        self.is_gpu = onnxruntime.get_device() == "GPU"

        if self.is_gpu:
            self.max_frame_rate = GPU_MAX_FRAME_RATE
        else:
            self.max_frame_rate = CPU_MAX_FRAME_RATE
        self.update_frame_rate_by_number_of_streams(1)

    def set_is_scenario(self, is_scenario):
        self.is_scenario = is_scenario

    def set_detection_mode(self, mode):
        self.detection_mode = mode

    def get_detection_mode(self):
        if self.is_scenario == False:
            return "PD"
        else:
            return self.detection_mode

    def update_frame_rate_by_number_of_streams(self, number_of_streams):
        if number_of_streams > 0:
            self.frame_rate = max(1, int(self.max_frame_rate / number_of_streams))
            print("[INFO] set frame rate as", self.frame_rate, flush=True)
        else:
            print(
                "[INFO] nothing change about frame rate since number of streams is 0",
                flush=True,
            )
        return self.frame_rate

    def get_recommended_frame_rate(self, number_of_streams):
        if number_of_streams > 0:
            return max(1, int(self.max_frame_rate / number_of_streams))
        else:
            return self.max_frame_rate

    def set_frame_rate(self, frame_rate):
        self.frame_rate = frame_rate

    def get_frame_rate(self):
        return self.frame_rate

    def set_lva_mode(self, lva_mode):
        self.lva_mode = lva_mode

    def update_parts(self, parts):
        logger.info("Updating Parts ... %s", parts)
        self.parts = parts

    def load_model(self, model_dir, is_default_model, is_scenario_model):
        if is_default_model:
            print("[INFO] Loading Default Model ...")

            model = None

            with open(model_dir + str("/cvexport.manifest")) as f:
                data = json.load(f)

            # FIXME to check whether we need to close the previous session
            if data["DomainType"] == "ObjectDetection":
                model = ObjectDetection(data, model_dir, None)
                return model

        elif is_scenario_model:
            print("[INFO] Loading Default Model ...")
            with open(model_dir + "/labels.txt", "r") as f:
                labels = [l.strip() for l in f.readlines()]
            model = ONNXRuntimeObjectDetection(model_dir + "/model.onnx", labels)

            return model

        else:
            logger.info("Load Model ...")
            with open("model/labels.txt", "r") as f:
                labels = [l.strip() for l in f.readlines()]
            model = ONNXRuntimeObjectDetection("model/model.onnx", labels)
            logger.info("Load Model, success")

            return model

        return None

    def download_and_update_model(self, model_uri, MODEL_DIR):
        print("download_and_update_model.", flush=True)
        self.model_downloading = True

        def run(self, model_uri, MODEL_DIR):

            self.lock.acquire()
            try:
                print("Downloading URL.", flush=True)
                get_file_zip(model_uri, MODEL_DIR)
                print("Downloading URL..., Complete!!!", flush=True)
                self.lock.release()
                self.model_downloading = False
                print("Updating Model...", flush=True)
                self.update_model("model")
                print("Updating Model..., Complete!!!", flush=True)

            except Exception:
                self.lock.release()
                self.model_downloading = False
                print(
                    "Download URL failed. Model_URI: %s, MODEL_DIR: %s"
                    % (model_uri, MODEL_DIR)
                )
                traceback.print_exc()

        threading.Thread(target=run, args=(self, model_uri, MODEL_DIR,)).start()

    def update_model(self, model_dir):
        is_default_model = "default_model" in model_dir
        is_scenario_model = "scenario_models" in model_dir
        model = self.load_model(model_dir, is_default_model, is_scenario_model)

        # Protected by Mutex
        self.lock.acquire()
        self.model = model
        self.lock.release()

    def Score(self, image):

        self.lock.acquire()
        predictions, inf_time = self.model.predict_image(image)
        self.lock.release()

        return predictions, inf_time
