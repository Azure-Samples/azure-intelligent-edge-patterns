import asyncio
import base64
import json
import logging
import os
import threading
import time

import cv2
import numpy as np
import requests
from azure.iot.device import IoTHubModuleClient, Message
from shapely.geometry import Polygon

from api.models import StreamModel
from exception_handler import PrintGetExceptionDetails
from invoke import gm
from object_detection import ObjectDetection
from onnxruntime_predict import ONNXRuntimeObjectDetection

# from tracker import Tracker
from scenarios import DangerZone, DefeatDetection, Detection, PartCounter
from utility import draw_label, get_file_zip, is_edge, normalize_rtsp

DETECTION_TYPE_NOTHING = "nothing"
DETECTION_TYPE_SUCCESS = "success"
DETECTION_TYPE_UNIDENTIFIED = "unidentified"
DETECTION_BUFFER_SIZE = 10000

# for Retraining
UPLOAD_INTERVAL = 5

LVA_MODE = os.environ.get("LVA_MODE", "grpc")
IS_OPENCV = os.environ.get("IS_OPENCV", "false")

DISPLAY_KEEP_ALIVE_THRESHOLD = 10  # seconds

try:
    iot = IoTHubModuleClient.create_from_edge_environment()
except:
    iot = None

logger = logging.getLogger(__name__)


class Stream:
    def __init__(
        self,
        cam_id,
        model,
        sender,
        cam_type="video_file",
        cam_source="./sample_video/video.mp4",
        send_video_to_cloud: bool = False,
    ):
        self.cam_id = cam_id
        self.model = model
        self.send_video_to_cloud = send_video_to_cloud
        self.send_video_to_cloud_threshold = 60
        self.send_video_to_cloud_parts = []
        self.recording_duration = 60

        self.render = False

        self.mutex = threading.Lock()

        self.cam_type = cam_type
        self.cam_source = None
        if self.model.is_gpu:
            frameRate = 30
        else:
            frameRate = 10
        # self.cam = cv2.VideoCapture(normalize_rtsp(cam_source))
        self.cam_is_alive = True
        self.last_display_keep_alive = None

        self.IMG_WIDTH = 960
        self.IMG_HEIGHT = 540
        self.image_shape = [540, 960]

        self.last_img = None
        self.last_recv_img = None
        # self.last_edge_img = None
        self.last_drawn_img = None
        self.last_prediction = []
        self.last_prediction_count = {}

        self.is_retrain = False
        self.confidence_min = 30 * 0.01
        self.confidence_max = 80 * 0.01
        self.max_images = 10
        self.last_upload_time = 0
        # self.is_upload_image = False
        # self.current_uploaded_images = {}

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

        # lva signal
        self.lva_last_send_time = time.time()
        self.lva_interval = 10
        self.lva_mode = LVA_MODE

        self.zmq_sender = sender
        self.last_update = None
        self.last_send = None
        self.use_line = False
        self.use_zone = False
        # self.tracker = Tracker()
        self.scenario = None
        self.scenario_type = None
        # self.start_zmq()
        self.is_benchmark = False

    def set_is_benchmark(self, is_benchmark):
        self.is_benchmark = is_benchmark

    def _stop(self):
        gm.invoke_graph_instance_deactivate(self.cam_id)

    def _set(self, rtspUrl, frameRate, recording_duration):
        gm.invoke_instance_set(self.lva_mode, self.cam_id,
                               rtspUrl, frameRate, recording_duration)

    def _start(self):
        gm.invoke_graph_instance_activate(self.cam_id)

    def reset_metrics(self):
        # self.mutex.acquire()
        self.detection_success_num = 0
        self.detection_unidentified_num = 0
        self.detection_total = 0
        self.detections = []
        # self.last_prediction_count = {}
        if self.scenario:
            self.scenario.reset_metrics()
        # self.mutex.release()

    def start_zmq(self):
        def run(self):

            while "flags" not in dir(self.last_drawn_img):
                logger.info("not sending last_drawn_img")
                time.sleep(2)
            cnt = 0
            while self.cam_is_alive:

                if self.last_send == self.last_update:
                    time.sleep(0.03)
                    continue
                cnt += 1
                if cnt % 30 == 1:
                    logging.info(
                        "send through channel {}".format(
                            bytes(self.cam_id, "utf-8"))
                    )
                # self.mutex.acquire()
                # FIXME may find a better way to deal with encoding
                self.zmq_sender.send_multipart(
                    [
                        bytes(self.cam_id, "utf-8"),
                        cv2.imencode(".jpg", self.last_drawn_img)[1].tobytes(),
                    ]
                )
                self.last_send = self.last_update
                # self.mutex.release()
                # FIXME need to fine tune this value
                time.sleep(0.03)

        threading.Thread(target=run, args=(self,)).start()

    def get_scenario_metrics(self):
        if self.scenario:
            return self.scenario.get_metrics()
        return []

    def restart_cam(self):

        print("[INFO] Restarting Cam", flush=True)

        # cam = cv2.VideoCapture(normalize_rtsp(self.cam_source))

        # Protected by Mutex
        # self.mutex.acquire()
        # self.cam.release()
        # self.cam = cam
        # self.mutex.release()

    def update_cam(
        self,
        cam_type,
        cam_source,
        frameRate,
        recording_duration,
        lva_mode,
        cam_id,
        has_aoi,
        aoi_info,
        scenario_type=None,
        line_info=None,
        zone_info=None,
    ):
        logger.info("Updating Cam ...")

        # if self.cam_type == cam_type and self.cam_source == cam_source:
        #    return
        if (
            self.cam_source != cam_source
            or round(self.frameRate) != round(frameRate)
            or self.lva_mode != lva_mode
            or self.recording_duration != recording_duration
        ):
            self.cam_source = cam_source
            self.frameRate = frameRate
            self.lva_mode = lva_mode
            self.recording_duration = recording_duration
            if IS_OPENCV == "true":
                logger.info("post to CVModule")
                data = {
                    "stream_id": self.cam_id,
                    "rtsp": self.cam_source,
                    "fps": self.frameRate,
                    "endpoint": "http://InferenceModule:5000",
                }
                res = requests.post(
                    "http://CVCaptureModule:9000/streams", json=data)
            else:
                self._update_instance(
                    normalize_rtsp(cam_source), str(frameRate), str(recording_duration))

        self.has_aoi = has_aoi
        self.aoi_info = aoi_info

        detection_mode = self.model.get_detection_mode()
        if detection_mode == "PC":
            print("[INFO] Line INFO", line_info, flush=True)
            self.scenario = PartCounter()
            self.scenario_type = self.model.detection_mode
            try:
                line_info = json.loads(line_info)
                self.use_line = line_info["useCountingLine"]
                lines = line_info["countingLines"]
                if len(lines) > 0:
                    x1 = int(lines[0]["label"][0]["x"])
                    y1 = int(lines[0]["label"][0]["y"])
                    x2 = int(lines[0]["label"][1]["x"])
                    y2 = int(lines[0]["label"][1]["y"])
                    self.scenario.set_line(x1, y1, x2, y2)
                    print("Upading Line:", flush=True)
                    print("    use_line:", self.use_line, flush=True)
                    print("        line:", x1, y1, x2, y2, flush=True)
                else:
                    print("Upading Line:", flush=True)
                    print("    use_line:", self.use_line, flush=True)

            except:
                self.use_line = False
                print("Upading Line[*]:", flush=True)
                print("    use_line   :", False, flush=True)

        elif detection_mode == "ES":
            print("[INFO] Zone INFO", zone_info, flush=True)
            self.scenario = DangerZone()
            self.scenario_type = self.model.detection_mode
            # FIXME
            self.scenario.set_targets(["Person"])
            try:
                zone_info = json.loads(zone_info)
                self.use_zone = zone_info["useDangerZone"]
                zones = zone_info["dangerZones"]
                _zones = []
                print("Upading Line:", flush=True)
                print("    use_zone:", self.use_zone, flush=True)
                for zone in zones:
                    x1 = int(zone["label"]["x1"])
                    y1 = int(zone["label"]["y1"])
                    x2 = int(zone["label"]["x2"])
                    y2 = int(zone["label"]["y2"])
                    _zones.append([x1, y1, x2, y2])
                    print("     zone:", x1, y1, x2, y2, flush=True)
                self.scenario.set_zones(_zones)

            except:
                self.use_zone = False
                print("Upading Zone[*]:", flush=True)
                print("    use_zone   :", False, flush=True)

        elif detection_mode == "DD":
            print("[INFO] Line INFO", line_info, flush=True)
            self.scenario = DefeatDetection()
            self.scenario_type = self.model.detection_mode
            # FIXME
            self.scenario.set_ok("Bottle - OK")
            self.scenario.set_ng("Bottle - NG")
            try:
                line_info = json.loads(line_info)
                self.use_line = line_info["useCountingLine"]
                lines = line_info["countingLines"]
                if len(lines) > 0:
                    x1 = int(lines[0]["label"][0]["x"])
                    y1 = int(lines[0]["label"][0]["y"])
                    x2 = int(lines[0]["label"][1]["x"])
                    y2 = int(lines[0]["label"][1]["y"])
                    self.scenario.set_line(x1, y1, x2, y2)
                    print("Upading Line:", flush=True)
                    print("    use_line:", self.use_line, flush=True)
                    print("        line:", x1, y1, x2, y2, flush=True)
                else:
                    print("Upading Line:", flush=True)
                    print("    use_line:", self.use_line, flush=True)

            except:
                self.use_line = False
                print("Upading Line[*]:", flush=True)
                print("    use_line   :", False, flush=True)
        else:
            self.scenario = None
            self.scenario_type = self.model.detection_mode

    def get_mode(self):
        return self.model.detection_mode

    def update_detection_status(self, predictions):
        # self.mutex.acquire()

        detection_type = DETECTION_TYPE_NOTHING
        for prediction in predictions:
            if detection_type != DETECTION_TYPE_SUCCESS:
                if prediction["probability"] >= self.threshold:
                    detection_type = DETECTION_TYPE_SUCCESS
                    break
                else:
                    detection_type = DETECTION_TYPE_UNIDENTIFIED

        if detection_type == DETECTION_TYPE_NOTHING:
            pass
        else:
            if self.detection_total == DETECTION_BUFFER_SIZE:
                oldest_detection = self.detections.pop(0)
                if oldest_detection == DETECTION_TYPE_UNIDENTIFIED:
                    self.detection_unidentified_num -= 1
                elif oldest_detection == DETECTION_TYPE_SUCCESS:
                    self.detection_success_num -= 1

                self.detections.append(detection_type)
                if detection_type == DETECTION_TYPE_UNIDENTIFIED:
                    self.detection_unidentified_num += 1
                elif detection_type == DETECTION_TYPE_SUCCESS:
                    self.detection_success_num += 1
            else:
                self.detections.append(detection_type)
                if detection_type == DETECTION_TYPE_UNIDENTIFIED:
                    self.detection_unidentified_num += 1
                elif detection_type == DETECTION_TYPE_SUCCESS:
                    self.detection_success_num += 1
                self.detection_total += 1

        # self.mutex.release()

    def _update_instance(self, rtspUrl, frameRate, recording_duration):
        if not self.is_benchmark:
            self._stop()
            self._set(rtspUrl, frameRate, recording_duration)
            self._start()
        logger.info(
            "Instance {} updated, rtsp = {}, frameRate = {}, recording_duration = {}".format(
                self.cam_id, rtspUrl, frameRate, recording_duration
            )
        )

    def update_retrain_parameters(
        self, is_retrain, confidence_min, confidence_max, max_images
    ):
        self.is_retrain = is_retrain
        self.max_images = max_images
        # FIMXE may need to move it to other place
        self.threshold = self.confidence_max
        self.confidence_min = confidence_min
        self.confidence_max = confidence_max

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

    def update_lva_mode(self, lva_mode):
        if lva_mode == self.lva_mode:
            logger.info("Not changing lva_mode.")
        else:
            self._stop()
            self.lva_mode = lva_mode
            self._set(self.cam_source, self.frameRate)
            self._start()
            logger.info("Change lva_mode to {}".format(lva_mode))

    def delete(self):
        # self.mutex.acquire()
        self.cam_is_alive = False
        # self.mutex.release()

        if IS_OPENCV == "true":
            logger.info("get CVModule")
            res = requests.get(
                "http://CVCaptureModule:9000/delete_stream/" + self.cam_id
            )
        else:
            gm.invoke_graph_instance_deactivate(self.cam_id)
        logger.info("Deactivate stream {}".format(self.cam_id))

    def predict(self, image):

        width = self.IMG_WIDTH
        ratio = self.IMG_WIDTH / image.shape[1]
        height = int(image.shape[0] * ratio + 0.000001)
        if height >= self.IMG_HEIGHT:
            height = self.IMG_HEIGHT
            ratio = self.IMG_HEIGHT / image.shape[0]
            width = int(image.shape[1] * ratio + 0.000001)

        image = cv2.resize(image, (width, height))

        # prediction
        # self.mutex.acquire()
        predictions, inf_time = self.model.Score(image)
        # print('predictions', predictions, flush=True)
        # self.mutex.release()

        # check whether it's the tag we want
        predictions = list(
            p for p in predictions if p["tagName"] in self.model.parts)

        # check whether it's inside aoi (if has)
        if self.has_aoi:
            _predictions = []
            for p in predictions:
                (x1, y1), (x2, y2) = parse_bbox(p, width, height)
                if is_inside_aoi(x1, y1, x2, y2, self.aoi_info):
                    _predictions.append(p)
            predictions = _predictions

        # update detection status before filter out by threshold
        self.update_detection_status(predictions)

        if self.is_retrain:
            self.process_retrain_image(predictions, image)

        if self.iothub_is_send:
            self.process_send_message_to_iothub(predictions)

        # check whether it's larger than threshold
        predictions = list(
            p for p in predictions if p["probability"] >= self.threshold)

        # update last_prediction_count
        _last_prediction_count = {}
        for p in predictions:
            tag = p["tagName"]
            if tag not in _last_prediction_count:
                _last_prediction_count[tag] = 1
            else:
                _last_prediction_count[tag] += 1
        self.last_prediction_count = _last_prediction_count

        # update the buffer
        # no need to copy since resize already did it
        self.last_img = image
        self.last_prediction = predictions

        # FIXME support more scenarios
        # Update Tracker / Scenario
        _detections = []
        for prediction in predictions:
            tag = prediction["tagName"]
            # if prediction['probability'] > 0.5:
            (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)
            _detections.append(
                Detection(tag, x1, y1, x2, y2, prediction["probability"])
            )
        if self.scenario:
            self.scenario.update(_detections)

        self.draw_img()
        if self.send_video_to_cloud:
            self.precess_send_signal_to_lva()

        if self.scenario:
            # print('drawing...', flush=True)
            # print(self.scenario, flush=True)
            self.last_drawn_img = self.scenario.draw_counter(
                self.last_drawn_img)
            # FIXME close this
            # self.scenario.draw_constraint(self.last_drawn_img)
            if self.get_mode() == "DD":
                self.scenario.draw_objs(self.last_drawn_img)

        # update avg inference time (moving avg)
        inf_time_ms = inf_time * 1000
        self.average_inference_time = (
            1 / 16 * inf_time_ms + 15 / 16 * self.average_inference_time
        )

    def process_retrain_image(self, predictions, img):
        for prediction in predictions:
            if self.last_upload_time + UPLOAD_INTERVAL < time.time():
                confidence = prediction["probability"]
                print(
                    "comparing...",
                    self.confidence_min,
                    confidence,
                    self.confidence_max,
                    flush=True,
                )
                if self.confidence_min <= confidence <= self.confidence_max:
                    print("preparing...", flush=True)
                    # prepare the data to send
                    tag = prediction["tagName"]
                    height, width = img.shape[0], img.shape[1]
                    (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)
                    labels = json.dumps(
                        [{"x1": x1, "x2": x2, "y1": y1, "y2": y2}])
                    jpg = cv2.imencode(".jpg", img)[1].tobytes()

                    send_retrain_image_to_webmodule(
                        jpg, tag, labels, confidence, self.cam_id
                    )

                    self.last_upload_time = time.time()
                    break

    def process_send_message_to_iothub(self, predictions):
        if self.iothub_last_send_time + self.iothub_interval < time.time():
            predictions = list(
                p for p in predictions if p["probability"] >= self.threshold
            )
            if len(predictions) > 0:
                send_message_to_iothub(predictions)
                self.iothub_last_send_time = time.time()

    def precess_send_signal_to_lva(self):
        if self.lva_last_send_time + self.lva_interval < time.time():
            to_send = False
            for p in self.last_prediction:
                if (
                    p["tagName"] in self.send_video_to_cloud_parts
                    and p["probability"] >= self.send_video_to_cloud_threshold
                ):
                    to_send = True
            logger.warning('********** precess send signal to lva **********')
            logger.warning('********** precess send signal to lva **********')
            logger.warning('parts to send: {}'.format(
                self.send_video_to_cloud_parts))
            logger.warning('sending threshold: {}'.format(
                self.send_video_to_cloud_threshold))
            logger.warning('to_send: {}'.format(to_send))
            logger.warning('********** precess send signal to lva **********')
            logger.warning('********** precess send signal to lva **********')
            if to_send:
                send_message_to_lva(self.cam_id)
                self.lva_last_send_time = time.time()
                self.lva_interval = 60

    def draw_img(self):

        img = self.last_img.copy()

        height, width = img.shape[0], img.shape[1]
        predictions = self.last_prediction

        if self.has_aoi:
            draw_aoi(img, self.aoi_info)

        if self.get_mode() != "DD":
            for prediction in predictions:
                if prediction["probability"] > self.threshold:
                    (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)
                    cv2.rectangle(img, (x1, max(y1, 15)),
                                  (x2, y2), (255, 255, 255), 1)
                    draw_confidence_level(img, prediction)

        self.last_drawn_img = img
        self.last_update = time.time()

    def to_api_model(self):
        return StreamModel(
            cam_id=self.cam_id,
            cam_type=self.cam_type,
            cam_source=self.cam_source,
            send_video_to_cloud=self.send_video_to_cloud,
        )

    def update_display_keep_alive(self):
        self.last_display_keep_alive = time.time()

    def display_is_alive(self):
        return self.last_display_keep_alive + DISPLAY_KEEP_ALIVE_THRESHOLD > time.time()

    def gen(self):
        while self.cam_is_alive and self.display_is_alive():
            if self.last_drawn_img is not None:
                jpg = cv2.imencode(".jpg", self.last_drawn_img)[1].tobytes()
                yield (
                    b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + jpg + b"\r\n"
                )
            time.sleep(0.04)


def web_module_url():
    if is_edge():
        return "WebModule:8000"
    else:
        return "localhost:8000"


def draw_aoi(img, aoi_info):
    for aoi_area in aoi_info:
        aoi_type = aoi_area["type"]
        label = aoi_area["label"]

        if aoi_type == "BBox":
            cv2.rectangle(
                img,
                (int(label["x1"]), int(label["y1"])),
                (int(label["x2"]), int(label["y2"])),
                (255, 255, 255),
                2,
            )

        elif aoi_area["type"] == "Polygon":
            l = len(label)
            for index, point in enumerate(label):
                p1 = (point["x"], point["y"])
                p2 = (label[(index + 1) % l]["x"], label[(index + 1) % l]["y"])
                cv2.line(img, p1, p2, (255, 255, 255), 2)


def is_inside_aoi(x1, y1, x2, y2, aoi_info):

    obj_shape = Polygon([[x1, y1], [x2, y1], [x2, y2], [x1, y2]])

    for aoi_area in aoi_info:
        aoi_type = aoi_area["type"]
        label = aoi_area["label"]

        if aoi_area["type"] == "BBox":
            if (
                (label["x1"] <= x1 <= label["x2"]) or (
                    label["x1"] <= x2 <= label["x2"])
            ) and (
                (label["y1"] <= y1 <= label["y2"]) or (
                    label["y1"] <= y2 <= label["y2"])
            ):
                return True

        elif aoi_area["type"] == "Polygon":
            points = []
            for point in label:
                points.append([point["x"], point["y"]])
            aoi_shape = Polygon(points)
            if aoi_shape.is_valid and aoi_shape.intersects(obj_shape):
                return True

    return False


def parse_bbox(prediction, width, height):
    x1 = int(prediction["boundingBox"]["left"] * width)
    y1 = int(prediction["boundingBox"]["top"] * height)
    x2 = x1 + int(prediction["boundingBox"]["width"] * width)
    y2 = y1 + int(prediction["boundingBox"]["height"] * height)
    x1 = min(max(x1, 0), width - 1)
    x2 = min(max(x2, 0), width - 1)
    y1 = min(max(y1, 0), height - 1)
    y2 = min(max(y2, 0), height - 1)
    return (x1, y1), (x2, y2)


def draw_confidence_level(img, prediction):
    height, width = img.shape[0], img.shape[1]

    font = cv2.FONT_HERSHEY_DUPLEX
    font_scale = 0.7
    thickness = 1

    prob_str = str(int(prediction["probability"] * 1000) / 10)
    prob_str = " (" + prob_str + "%)"

    (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)

    text = prediction["tagName"] + prob_str
    img = draw_label(img, text, (x1, max(y1, 15)))

    return img


def send_message_to_iothub(predictions):
    if iot:
        try:
            iot.send_message_to_output(json.dumps(predictions), "metrics")
        except:
            print("[ERROR] Failed to send message to iothub", flush=True)
        print("[INFO] sending metrics to iothub", flush=True)
    else:
        # print('[METRICS]', json.dumps(predictions_to_send))
        pass


def send_message_to_lva(cam_id):
    if iot:
        try:
            target = "/graphInstances/" + str(cam_id)
            msg = Message("")
            msg.custom_properties["eventTarget"] = target
            iot.send_message_to_output(msg, "InferenceToLVA")
        except:
            print("[ERROR] Failed to send signal to LVA", flush=True)
        print("[INFO] sending signal to LVA", flush=True)
    else:
        # print('[INFO] Cannot detect IoT module')
        pass


def send_retrain_image_to_webmodule(jpg, tag, labels, confidence, cam_id):
    print("[INFO] Sending Image to relabeling", tag, flush=True)
    try:
        # requests.post('http://'+web_module_url()+'/api/relabel', data={
        res = requests.post(
            "http://"
            + web_module_url()
            + "/api/part_detections/1/upload_relabel_image/",
            data={
                "confidence": confidence,
                "labels": labels,
                "part_name": tag,
                "is_relabel": True,
                "img": base64.b64encode(jpg),
                "camera_id": cam_id,
            },
        )
    except:
        print("[ERROR] Failed to update image for relabeling", flush=True)
