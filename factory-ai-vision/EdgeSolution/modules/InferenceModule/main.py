"""Inference App
"""

import base64
import json
import sys
import threading
import time
import socket

import cv2
import numpy as np
import onnxruntime
import requests
import zmq
from azure.iot.device import IoTHubModuleClient
from flask import Flask, Response, request
from shapely.geometry import Polygon

from object_detection import ObjectDetection
from onnxruntime_predict import ONNXRuntimeObjectDetection
from scenarios import DangerZone, DefeatDetection, Detection, PartCounter, PartDetection
from tracker import Tracker, draw_counter
from utility import draw_label, get_file_zip, is_edge, normalize_rtsp

# tracker = Tracker()
# tracker.set_line(170/2, 680/2, 1487/2, 815/2)

# scenario = PartCounter()
# scenario.set_line(185, 290, 793, 327)


# scenario = DangerZone()
# scenario.set_zones([[85, 340, 743, 407]])
# scenario.set_targets(['Person'])

# scenario = DangerZone()
# scenario.set_zones([[85, 340, 743, 407]])
# scenario.set_targets(['Box'])

#scenario = DefeatDetection()
#scenario.set_ok("Bottle - OK")
#scenario.set_ng("Bottle - NG")
#scenario.set_line(600, 0, 600, 800)

scenario = PartDetection()
#scenario.set_parts(["Bottle - OK", "Bottle - NG"])
scenario.set_parts(["Box"])


# scenario= DefeatDetection()
# scenario.set_ok('Box')
# scenario.set_line(85, 340, 743, 407)


SAMPLE_VIDEO = "./sample_video/video.mp4"
SCENARIO1_VIDEO = "../RtspSimModule/videos/scenario1-counting-objects.mkv"
SCENARIO2_VIDEO = "../RtspSimModule/videos/scenario2-employ-safety.mkv"
SCENARIO3_VIDEO = "../RtspSimModule/videos/scenario3-defect-detection.mkv"

DEFAULT_MODEL = "default_model"
SCENARIO1_MODEL = "scenario_models/1/onnx"
SCENARIO2_MODEL = "scenario_models/2/onnx"
SCENARIO3_MODEL = "scenario_models/3/onnx"
DOWNLOADED_MODEL = "model"

### CONFIGURATION <BEG> ###
CAM_SOURCE = SCENARIO1_VIDEO
MODEL = SCENARIO1_MODEL

### CONFIGURATION <END> ###


# this is the dir for saving new model
MODEL_DIR = "model"
UPLOAD_INTERVAL = 1  # sec

DETECTION_TYPE_NOTHING = "nothing"
DETECTION_TYPE_SUCCESS = "success"
DETECTION_TYPE_UNIDENTIFIED = "unidentified"
DETECTION_BUFFER_SIZE = 10000

IMG_WIDTH = 960
IMG_HEIGHT = 540

if len(sys.argv) > 1:
    print(sys.argv)
    DEBUG = sys.argv[1] == "debug"
else:
    DEBUG = False
DEBUG = True

try:
    iot = IoTHubModuleClient.create_from_edge_environment()
except:
    iot = None


def web_module_url():
    if is_edge():
        ip = socket.gethostbyname("Webodule")
        return ip + ":8181"
        # return "172.18.0.1:8181"
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

    return


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

    # font = cv2.FONT_HERSHEY_DUPLEX
    # font_scale = 0.5
    # thickness = 1

    prob_str = str(int(prediction["probability"] * 1000) / 10)
    prob_str = " (" + prob_str + "%)"

    (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)

    # img = cv2.putText(img, prediction['tagName']+prob_str,
    #                  (x1, y1-5), font, font_scale, (255, 255, 255), thickness)
    text = prediction["tagName"] + prob_str
    img = draw_label(img, text, (x1, max(y1, 15)))

    return img


def draw_oid(img, x1, y1, oid):
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.7
    thickness = 2
    img = cv2.putText(
        img, str(oid), (x1 + 10, y1 +
                        20), font, font_scale, (255, 255, 255), thickness
    )
    return img


# def draw_counter(img, counter):
#    font = cv2.FONT_HERSHEY_SIMPLEX
#    font_scale = 0.7
#    thickness = 2
#    img = cv2.putText(img, 'Objects: '+str(counter),
#                      (img.shape[1]-150, 30), font, font_scale, (0, 255, 255), thickness)
#    return img


class ONNXRuntimeModelDeploy(ObjectDetection):
    """Object Detection class for ONNX Runtime
    """

    # def __init__(self, model_dir, cam_type="video_file", cam_source="./sample_video/video.mp4"):
    def __init__(self, model_dir, cam_type="video_file", cam_source=CAM_SOURCE):
        # def __init__(self, model_dir, cam_type="video_file", cam_source="./mov_bbb.mp4"):
        # def __init__(self, model_dir, cam_type="video_file", cam_source="./sample_video/video_1min.mp4"):
        # def __init__(self, model_dir, cam_type="rtsp", cam_source="rtsp://52.229.36.89:554/media/catvideo.mkv"):
        # Default system params
        self.render = False

        self.lock = threading.Lock()

        self.cam_type = cam_type
        self.cam_source = cam_source
        self.cam = cv2.VideoCapture(normalize_rtsp(cam_source))
        self.cam_is_alive = False

        self.model = self.load_model(model_dir, is_default_model=True)
        self.model_uri = None

        self.last_img = None
        self.last_edge_img = None
        self.last_drawn_img = None
        self.last_prediction = []
        self.last_prediction_count = {}

        self.part_detection_id = None
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

        self.is_gpu = onnxruntime.get_device() == "GPU"
        self.average_inference_time = 0

        # IoT Hub
        self.iothub_is_send = False
        self.iothub_threshold = 0.5
        self.iothub_fpm = 0
        self.iothub_last_send_time = time.time()
        self.iothub_interval = 99999999
        # self.iothub_is_send = True
        # self.iothub_threshold = 0.8
        # self.iothub_fpm = 1
        # self.iothub_last_send_time = time.time()
        # self.iothub_interval = 5

    def restart_cam(self):

        print("[INFO] Restarting Cam")

        cam = cv2.VideoCapture(normalize_rtsp(self.cam_source))

        # Protected by Mutex
        self.lock.acquire()
        self.cam.release()
        self.cam = cam
        self.lock.release()

    def update_parts(self, parts):
        print("[INFO] Updating Parts ...", parts)
        self.parts = parts

    def update_cam(self, cam_type, cam_source, has_aoi, aoi_info):
        print("[INFO] Updating Cam ...")
        # print('  cam_type', cam_type)
        # print('  cam_source', cam_source)

        if cam_source == "0":
            cam_source = 0
        elif cam_source == "1":
            cam_source = 1
        elif cam_source == "2":
            cam_source = 2
        elif cam_source == "3":
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
        update_instance(normalize_rtsp(cam_source))

    def load_model(self, model_dir, is_default_model):
        if is_default_model:
            print("[INFO] Loading Default Model ...")

            model = None

            with open(model_dir + str("/cvexport.manifest")) as f:
                data = json.load(f)

            # FIXME to check whether we need to close the previous session
            if data["DomainType"] == "ObjectDetection":
                model = ObjectDetection(data, model_dir, None)
                return model

        else:
            print("[INFO] Loading Downloaded Model ...")
            with open("model/labels.txt", "r") as f:
                labels = [l.strip() for l in f.readlines()]
            model = ONNXRuntimeObjectDetection("model/model.onnx", labels)

            return model

        return None

    def update_retrain_parameters(self, confidence_min, confidence_max, max_images):
        self.confidence_min = confidence_min * 0.01
        self.confidence_max = confidence_max * 0.01
        self.max_images = max_imagese
        self.threshold = self.confidence_max

    def update_model(self, model_dir):
        is_default_model = "default_model" in model_dir and "scenario" not in model_dir
        model = self.load_model(model_dir, is_default_model)

        # Protected by Mutex
        self.lock.acquire()
        self.model = model
        self.current_uploaded_images = {}
        self.is_upload_image = True

        self.detection_success_num = 0
        self.detection_unidentified_num = 0
        self.detection_total = 0  # nothing isn't included
        self.detections = []

        self.lock.release()

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

    def predict(self, image):

        self.lock.acquire()
        prediction, inf_time = self.model.predict_image(image)
        # print('prediction')
        # prediction = []
        # inf_time = 1
        self.lock.release()

        inf_time_ms = inf_time * 1000
        self.average_inference_time = (
            1 / 16 * inf_time_ms + 15 / 16 * self.average_inference_time
        )

        return prediction

    def local_test(self):
        cap = cv2.VideoCapture(0)
        while True:
            _, img = cap.read()
            cv2.imshow("img", img)
            res = self.predict(img)
            print(res)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break


# model_dir = './default_model'
model_dir = MODEL
# model_dir = './default_model_6parts'
onnx = ONNXRuntimeModelDeploy(model_dir)
# onnx.start_session()

app = Flask(__name__)


@app.route("/update_part_detection_id", methods=["GET"])
def update_part_detection_id():
    part_detection_id = request.args.get("part_detection_id")
    if not part_detection_id:
        return "missing part_detection_id"
    onnx.part_detection_id = part_detection_id
    print("[INFO] updating onnx.part_detection_id:", onnx.part_detection_id)
    return "OK"


@app.route("/prediction", methods=["GET"])
def prediction():
    # print(onnx.last_prediction)
    # onnx.last_prediction
    return json.dumps(onnx.last_prediction)


@app.route("/open_cam", methods=["GET"])
def open_cam():
    return _open_cam()


def _open_cam():
    def post_img():
        headers = {"Content-Type": "image/jpg"}
        t0 = time.time()
        while onnx.cam.isOpened():
            if onnx.cam_is_alive == False:
                break
            onnx.lock.acquire()
            b, img = onnx.cam.read()
            onnx.lock.release()
            if b:
                # data = cv2.imencode(".jpg", img)[1].tobytes()
                # r = requests.post('http://127.0.0.1:5000/predict',
                #                  headers=headers, data=data)
                _predict(img)
            else:
                print(b)
                break

            # time.sleep(0.02)
        t1 = time.time()
        print(t1 - t0)

    if onnx.cam_is_alive == False:
        onnx.lock.acquire()
        onnx.cam_is_alive = True
        onnx.lock.release()
        threading.Thread(target=post_img).start()
        return "open camera", 200
    else:
        return "camera is already opened", 200


@app.route("/close_cam", methods=["GET"])
def close_cam():
    onnx.lock.acquire()
    onnx.cam_is_alive = False
    onnx.lock.release()
    return "camera closed", 200


@app.route("/predict", methods=["POST"])
def predict():
    nparr = np.frombuffer(request.data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return _predict(img)


def _predict(img):
    # print(request.data)
    try:
        # nparr = np.frombuffer(request.data, np.uint8)
        # img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # resize
        width = IMG_WIDTH
        ratio = IMG_WIDTH / img.shape[1]
        height = int(img.shape[0] * ratio + 0.000001)
        if height >= IMG_HEIGHT:
            height = IMG_HEIGHT
            ratio = IMG_HEIGHT / img.shape[0]
            width = int(img.shape[1] * ratio + 0.000001)

        img = cv2.resize(img, (width, height))

        predictions = onnx.predict(img)
        if DEBUG:
            onnx.last_prediction = predictions
        else:
            onnx.last_prediction = list(
                prediction
                for prediction in predictions
                if prediction["tagName"] in onnx.parts
            )
        results = []
        for prediction in predictions:
            tag_name = prediction["tagName"]
            confidence = prediction["probability"]
            box = {
                "l": prediction["boundingBox"]["left"],
                "t": prediction["boundingBox"]["top"],
                "w": prediction["boundingBox"]["width"],
                "h": prediction["boundingBox"]["height"],
            }
            results.append(
                {
                    "type": "entity",
                    "entity": {
                        "tag": {"value": tag_name, "confidence": confidence},
                        "box": box,
                    },
                }
            )
        onnx.last_img = img
        gen_edge()
        post_run()
        if len(results) > 0:
            return json.dumps({"inferences": results}), 200
    except:
        print("[ERROR] Unexpected error:", sys.exc_info()[0], flush=True)

    return "", 204


@app.route("/metrics", methods=["GET"])
def metrics():
    inference_num = onnx.detection_success_num
    unidentified_num = onnx.detection_unidentified_num
    total = onnx.detection_total
    is_gpu = onnx.is_gpu
    average_inference_time = onnx.average_inference_time
    last_prediction_count = onnx.last_prediction_count
    if total == 0:
        success_rate = 0
    else:
        success_rate = inference_num * 100 / total
    return json.dumps(
        {
            "success_rate": success_rate,
            "inference_num": inference_num,
            "unidentified_num": unidentified_num,
            "is_gpu": is_gpu,
            "average_inference_time": average_inference_time,
            "last_prediction_count": last_prediction_count,
            "scenario_metrics": scenario.get_metrics(),
        }
    )


@app.route("/update_retrain_parameters")
def update_retrain_parameters():

    confidence_min = request.args.get("confidence_min")
    if not confidence_min:
        return "missing confidence_min"

    confidence_max = request.args.get("confidence_max")
    if not confidence_max:
        return "missing confidence_max"

    max_images = request.args.get("max_images")
    if not max_images:
        return "missing max_images"

    onnx.confidence_min = int(confidence_min) * 0.01
    onnx.confidence_max = int(confidence_max) * 0.01
    onnx.max_images = int(max_images)

    print("[INFO] updaing retrain parameters to")
    print("  conficen_min:", confidence_min)
    print("  conficen_max:", confidence_max)
    print("  max_images  :", max_images)

    return "ok"


@app.route("/update_model")
def update_model():

    model_uri = request.args.get("model_uri")
    model_dir = request.args.get("model_dir")
    if not model_uri and not model_dir:
        return "missing model_uri or model_dir"

    logger.info("Update Model ...")
    if model_uri:

        logger.info("Got Model URI %s", model_uri)

        if model_uri == onnx.model_uri:
            logger.info("Model URI unchanged")
        else:
            get_file_zip(model_uri, MODEL_DIR)
            onnx.model_uri = model_uri

        onnx.update_model("model")
        logger.info("Update Finished ...")

        return "ok"

    elif model_dir:
        print("[INFO] Got Model DIR", model_dir)
        onnx.update_model(model_dir)
        print("[INFO] Update Finished ...")
        return "ok"


@app.route("/update_cam")
def update_cam():

    cam_type = request.args.get("cam_type")
    cam_source = request.args.get("cam_source")

    if not cam_type:
        return "missing cam_type"
    if not cam_source:
        return "missing cam_source"

    print("updating cam ...")
    print("  cam_type", cam_type)
    print("  cam_source", cam_source)

    aoi = request.args.get("aoi")
    try:
        aoi = json.loads(aoi)
        has_aoi = aoi["useAOI"]
        aoi_info = aoi["AOIs"]
    except:
        has_aoi = False
        aoi_info = None

    print("  has_aoi", has_aoi)
    print("  aoi_info", aoi_info)

    onnx.update_cam(cam_type, cam_source, has_aoi, aoi_info)

    return "ok"


@app.route("/update_parts")
def update_parts():
    try:
        print("----Upadate parts----")
        parts = request.args.getlist("parts")
        print("[INFO] Updating parts", parts)
        onnx.parts = parts
        print("[INFO] Updated parts", parts)
    except:
        print("[ERROR] Unknown format", parts)
        # return 'unknown format'

    onnx.update_parts(parts)

    return "ok"


# @app.route('/update_threshold')
# def update_threshold():
#    print('[WARNING] is depreciated')
#    return 'ok'


@app.route("/update_iothub_parameters")
def update_iothub_parameters():
    is_send = request.args.get("is_send")
    threshold = request.args.get("threshold")
    fpm = request.args.get("fpm")

    if not is_send:
        return "missing is_send"
    if not threshold:
        return "missing threshold"
    if not fpm:
        return "missing fpm"

    is_send = is_send == "True"
    threshold = int(threshold) * 0.01
    fpm = int(fpm)

    print("updating iothub parameters ...")
    print("  is_send", is_send)
    print("  threshold", threshold)
    print("  fpm", fpm)

    onnx.update_iothub_parameters(is_send, threshold, fpm)
    return "ok"


@app.route("/update_prob_threshold")
def update_prob_threshold():
    prob_threshold = request.args.get("prob_threshold")
    if not prob_threshold:
        return "missing prob_threshold"

    onnx.threshold = int(prob_threshold) * 0.01
    print("[INFO] updaing prob_threshold to")
    print("  prob_threshold:", prob_threshold)

    onnx.lock.acquire()
    onnx.detection_success_num = 0
    onnx.detection_unidentified_num = 0
    onnx.detection_total = 0
    onnx.detections = []
    onnx.lock.release()

    return "ok"


_m = (170 - 1487) / (680 - 815)
_b = 680 / 2 - _m * 170 / 2


def compute_direction(x, y):
    return _m * x + _b - y


def is_same_direction(x1, y1, x2, y2):
    return 0.000000001 < (compute_direction(x1, y1) * compute_direction(x2, y2))


@app.route("/video_feed")
def video_feed():
    inference = not not request.args.get("inference")
    print(inference)

    def _gen():
        detected = {}  # FIXME need to gc
        counter = 0
        while True:
            img = onnx.last_img.copy()
            detections = []
            if inference:
                height, width = img.shape[0], img.shape[1]
                predictions = onnx.last_prediction
                # print(predictions)
                for prediction in predictions:
                    tag = prediction["tagName"]

                    if onnx.has_aoi:
                        draw_aoi(img, onnx.aoi_info)

                    (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)

                    detections.append(
                        Detection(tag, x1, y1, x2, y2,
                                  prediction["probability"])
                    )
                    # print(x1, y1, x2, y2)

                    if prediction["probability"] > onnx.threshold:
                        if onnx.has_aoi:
                            if not is_inside_aoi(x1, y1, x2, y2, onnx.aoi_info):
                                continue

                        # img = cv2.rectangle(
                        #    img, (x1, y1), (x2, y2), (255, 255, 255), 1)
                        # img = draw_confidence_level(img, prediction)

            # objs = mot_tracker.update(np.array(detections))
            t0 = time.time()
            scenario.update(detections)
            print("update", time.time() - t0)
            t0 = time.time()
            scenario.draw_counter(img)
            print("draw", time.time() - t0)
            t0 = time.time()
            scenario.draw_constraint(img)
            print("draw c", time.time() - t0)
            scenario.draw_objs(img)
            # counter, objs, counted = tracker.update(detections)

            time.sleep(0.02)
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + cv2.imencode(".jpg", img)[1].tobytes()
                + b"\r\n"
            )

    return Response(_gen(), mimetype="multipart/x-mixed-replace; boundary=frame")


# if inference = true


def gen():

    while "flags" not in dir(onnx.last_img):
        print("not sending")
        time.sleep(1)

    while True:
        img = onnx.last_img.copy()

        height, width = img.shape[0], img.shape[1]
        predictions = onnx.last_prediction
        for prediction in predictions:
            tag = prediction["tagName"]

            if onnx.has_aoi:
                draw_aoi(img, onnx.aoi_info)

            if prediction["probability"] > onnx.threshold:
                (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)
                if onnx.has_aoi:
                    if not is_inside_aoi(x1, y1, x2, y2, onnx.aoi_info):
                        continue

                img = cv2.rectangle(
                    img, (x1, y1), (x2, y2), (255, 255, 255), 2)
                img = draw_confidence_level(img, prediction)
        onnx.last_drawn_img = img

        time.sleep(0.02)


def post_run():
    send_counter = 0

    # print(onnx.last_prediction)
    last_prediction_count = {}

    height, width = onnx.last_img.shape[0], onnx.last_img.shape[1]

    detection = DETECTION_TYPE_NOTHING
    if True:
        send_counter += 1
        if onnx.iothub_is_send:
            if onnx.iothub_last_send_time + onnx.iothub_interval < time.time():
                predictions_to_send = []
                for prediction in onnx.last_prediction:
                    _p = prediction["probability"]
                    if _p < onnx.iothub_threshold:
                        continue
                    x1 = int(prediction["boundingBox"]["left"] * width)
                    y1 = int(prediction["boundingBox"]["top"] * height)
                    x2 = x1 + int(prediction["boundingBox"]["width"] * width)
                    y2 = y1 + int(prediction["boundingBox"]["height"] * height)
                    x1 = min(max(x1, 0), width - 1)
                    x2 = min(max(x2, 0), width - 1)
                    y1 = min(max(y1, 0), height - 1)
                    y2 = min(max(y2, 0), height - 1)
                    if onnx.has_aoi:
                        if not is_inside_aoi(x1, y1, x2, y2, onnx.aoi_info):
                            continue

                    predictions_to_send.append(prediction)
                if len(predictions_to_send) > 0:
                    if iot:
                        try:
                            iot.send_message_to_output(
                                json.dumps(predictions_to_send), "metrics"
                            )
                        except:
                            print(
                                "[ERROR] Failed to send message to iothub", flush=True
                            )
                        print("[INFO] sending metrics to iothub")
                    else:
                        # print('[METRICS]', json.dumps(predictions_to_send))
                        pass
                    onnx.iothub_last_send_time = time.time()

        for prediction in onnx.last_prediction:

            tag = prediction["tagName"]

            if prediction["probability"] > onnx.threshold:
                if tag not in last_prediction_count:
                    last_prediction_count[tag] = 1
                else:
                    last_prediction_count[tag] += 1

            (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)
            if onnx.has_aoi:
                if not is_inside_aoi(x1, y1, x2, y2, onnx.aoi_info):
                    continue

            if detection != DETECTION_TYPE_SUCCESS:
                if prediction["probability"] >= onnx.threshold:
                    detection = DETECTION_TYPE_SUCCESS
                else:
                    detection = DETECTION_TYPE_UNIDENTIFIED

            if onnx.last_upload_time + UPLOAD_INTERVAL < time.time():
                if (
                    onnx.confidence_min
                    <= prediction["probability"]
                    <= onnx.confidence_max
                ):
                    if onnx.is_upload_image:
                        # if tag in onnx.current_uploaded_images and onnx.current_uploaded_images[tag] >= onnx.max_images:
                        # if tag in onnx.current_uploaded_images:
                        # No limit for the max_images in inference module now, the logic is moved to webmodule
                        #    pass
                        # else:
                        if True:

                            labels = json.dumps(
                                [{"x1": x1, "x2": x2, "y1": y1, "y2": y2}]
                            )
                            print(
                                "[INFO] Sending Image to relabeling",
                                tag,
                                onnx.current_uploaded_images.get(tag, 0),
                                labels,
                            )
                            # onnx.current_uploaded_images[tag] = onnx.current_uploaded_images.get(tag, 0) + 1
                            onnx.last_upload_time = time.time()

                            jpg = cv2.imencode(".jpg", img)[1].tobytes()
                            try:
                                requests.post(
                                    "http://" + web_module_url() + "/api/relabel",
                                    data={
                                        "confidence": prediction["probability"],
                                        "labels": labels,
                                        "part_name": tag,
                                        "is_relabel": True,
                                        "img": base64.b64encode(jpg),
                                    },
                                )
                            except:
                                print(
                                    "[ERROR] Failed to update image for relabeling")

    onnx.last_prediction_count = last_prediction_count

    onnx.lock.acquire()
    if detection == DETECTION_TYPE_NOTHING:
        pass
    else:
        if onnx.detection_total == DETECTION_BUFFER_SIZE:
            oldest_detection = onnx.detections.pop(0)
            if oldest_detection == DETECTION_TYPE_UNIDENTIFIED:
                onnx.detection_unidentified_num -= 1
            elif oldest_detection == DETECTION_TYPE_SUCCESS:
                onnx.detection_success_num -= 1

            onnx.detections.append(detection)
            if detection == DETECTION_TYPE_UNIDENTIFIED:
                onnx.detection_unidentified_num += 1
            elif detection == DETECTION_TYPE_SUCCESS:
                onnx.detection_success_num += 1
        else:
            onnx.detections.append(detection)
            if detection == DETECTION_TYPE_UNIDENTIFIED:
                onnx.detection_unidentified_num += 1
            elif detection == DETECTION_TYPE_SUCCESS:
                onnx.detection_success_num += 1
            onnx.detection_total += 1

    onnx.lock.release()
    # print(detection)


def update_instance(rtspUrl):
    payload = {"@apiVersion": "1.0", "name": "http1"}
    payload_set = {
        "@apiVersion": "1.0",
        "name": "http1",
        "properties": {
            "topologyName": "InferencingWithHttpExtension5",
            "description": "Sample graph description",
            "parameters": [
                {"name": "rtspUrl", "value": rtspUrl},
                {
                    "name": "inferencingUrl",
                    "value": "http://InferenceModule:5000/predict",
                },
            ],
        },
    }
    GraphInstanceMethod("GraphInstanceDeactivate", payload)
    GraphInstanceMethod("GraphInstanceSet", payload_set)
    GraphInstanceMethod("GraphInstanceActivate", payload)
    print("instance updated")


def GraphInstanceMethod(method, payload):

    body = {
        "methodName": method,
        "responseTimeoutInSeconds": 10,
        "connectTimeoutInSeconds": 10,
        "payload": payload,
    }

    url = "https://main.iothub.ext.azure.com/api/dataPlane/post"
    data = {
        "apiVersion": "2018-06-30",
        "authorizationPolicyKey": "rDav1fU61BRTezz8NewMe/UNasZob1rQ8FowPqrbD28=",
        "authorizationPolicyName": "service",
        "hostName": "customvision.azure-devices.net",
        "requestPath": "/twins/testcam/modules/lvaEdge/methods",
        "requestBody": str(body),
    }

    header = {
        "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Imh1Tjk1SXZQZmVocTM0R3pCRFoxR1hHaXJuTSIsImtpZCI6Imh1Tjk1SXZQZmVocTM0R3pCRFoxR1hHaXJuTSJ9.eyJhdWQiOiJodHRwczovL21hbmFnZW1lbnQuY29yZS53aW5kb3dzLm5ldC8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yY2Y0MjQ4ZS00ODM2LTQyMDItYjc5Ni05YTE1ODlmZjQ2MTMvIiwiaWF0IjoxNTk3NjQzNDAyLCJuYmYiOjE1OTc2NDM0MDIsImV4cCI6MTU5NzY0NzMwMiwiYWNyIjoiMSIsImFpbyI6IkFUUUF5LzhRQUFBQS9ZbnFvb28rb0FBZTNIS3c3VE11aHlrNCtUczVxOG5XaFJMUEJYM1BqMWxFekRFUHU4UkJMQk81U2g4eW1jdkkiLCJhbXIiOlsicHdkIl0sImFwcGlkIjoiYzQ0YjQwODMtM2JiMC00OWMxLWI0N2QtOTc0ZTUzY2JkZjNjIiwiYXBwaWRhY3IiOiIyIiwiZmFtaWx5X25hbWUiOiJQYWkiLCJnaXZlbl9uYW1lIjoiUm9uIiwiZ3JvdXBzIjpbIjBkNzEyYWUxLTc3ZDktNGM5NS05NTFmLTk0MDIwOTM3NjczZCJdLCJpcGFkZHIiOiIxMjIuMTE2LjE4NS4yMDMiLCJuYW1lIjoiUm9uIFBhaSIsIm9pZCI6IjAyNDIyOWI3LTk5NGMtNDRjZC05MjFiLTU2M2Q1YWIxY2IwNSIsInB1aWQiOiIxMDAzMjAwMEM1RTA3M0UwIiwic2NwIjoidXNlcl9pbXBlcnNvbmF0aW9uIiwic3ViIjoiYXhsLWN1S28wR1VfOWd5UVJFQnhCREhReWRLQndOalFmRGNBdFRlLVZRbyIsInRpZCI6IjJjZjQyNDhlLTQ4MzYtNDIwMi1iNzk2LTlhMTU4OWZmNDYxMyIsInVuaXF1ZV9uYW1lIjoicm9ucGFpQGxpbmtlcm5ldHdvcmtzLmNvbSIsInVwbiI6InJvbnBhaUBsaW5rZXJuZXR3b3Jrcy5jb20iLCJ1dGkiOiI4aE1GbUtuZDJFUzdrYUtDWmJlVkFBIiwidmVyIjoiMS4wIiwieG1zX3RjZHQiOjE1MDgyMTE3NjB9.GQj59K9o0Ke8ZzXZHrXP6IEQvy3RuYzlV3S4jhtsN3V1QBMBkbcI47Ix3vi5OQw5k5StESaQmaiVwL-2KJ1GGVgUhI0vh5JnuOGZAybZthWQgGz8YgixVnXbzFrcb3u-OeSmCDTg350wmmaA3-rmw5S6BjHIHx0t1mbWOM5oU1y4OY-R92cbkn4lOx50NS73Lmxt8BDYT1xWJEUeXL097ekeG1HmHbAMgNENryOYJq2v6RM2VpLnQNoEpPqzQjw9BLDVE33NwoRCs50S68tO4k2diYXXZeeC6W_MYm9O_h9fTSKmUqjYc05OXyG9GnSGwzne5DaBjeVovthpho7xEA"
    }
    res = requests.post(url, headers=header, data=data)
    print(res.json())


def gen_edge():

    while "flags" not in dir(onnx.last_img):
        print("no last_img")
        time.sleep(1)

    img = onnx.last_img.copy()

    height, width = img.shape[0], img.shape[1]
    predictions = onnx.last_prediction
    for prediction in predictions:
        tag = prediction["tagName"]

        if onnx.has_aoi:
            # for aoi_area in onnx.aoi_info:
            # img = cv2.rectangle(img, (int(aoi_area['x1']), int(aoi_area['y1'])), (int(
            #    aoi_area['x2']), int(aoi_area['y2'])), (0, 255, 255), 2)
            draw_aoi(img, onnx.aoi_info)

        if prediction["probability"] > onnx.threshold:
            (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)
            if onnx.has_aoi:
                if not is_inside_aoi(x1, y1, x2, y2, onnx.aoi_info):
                    continue

            img = cv2.rectangle(img, (x1, y1), (x2, y2), (255, 255, 255), 2)
            img = draw_confidence_level(img, prediction)
    onnx.last_drawn_img = img

    # while loop delay
    # time.sleep(0.02)


def gen_zmq():
    context = zmq.Context()
    sender = context.socket(zmq.PUSH)
    # sender.connect("tcp://localhost:5558")
    sender.bind("tcp://*:5558")

    while "flags" not in dir(onnx.last_drawn_img):
        print("not sending last_drawn_img")
        time.sleep(1)
    cnt = 0
    while True:
        cnt += 1
        sender.send_pyobj(
            {
                "data": cv2.imencode(".jpg", onnx.last_drawn_img)[1].tobytes(),
                "ts": str(cnt),
                "shape": (540, 960, 3),
            }
        )
        # sender.send(cv2.imencode(".jpg", onnx.last_img)[1].tostring())
        # time.sleep(2)
        time.sleep(0.04)


def twin_update_listener(client):
    while True:
        patch = client.receive_twin_desired_properties_patch()  # blocking call
        print("[INFO] Twin desired properties patch received:", flush=True)
        print("[INFO]", patch, flush=True)

        if "model_uri" not in patch:
            print("[WARNING] missing model_uri", flush=True)
            continue

        model_uri = patch["model_uri"]
        print("[INFO] Got Model URI", model_uri, flush=True)

        if model_uri == onnx.model_uri:
            print("[INFO] Model Uri unchanged", flush=True)
        else:
            get_file_zip(model_uri, MODEL_DIR)
            onnx.model_uri = model_uri

        onnx.update_model("model")
        print("[INFO] Update Finished ...", flush=True)


def iothub_client_run():
    try:
        module_client = IoTHubModuleClient.create_from_edge_environment()

        twin_update_listener_thread = threading.Thread(
            target=twin_update_listener, args=(module_client,)
        )
        twin_update_listener_thread.daemon = True
        twin_update_listener_thread.start()
    except:
        print("[WARNING] Unexpected error:", sys.exc_info()[0], flush=True)
        print("[WARNING] No IoT Edge Environment", flush=True)


def main():
    # threading.Thread(target=gen).start()
    # threading.Thread(target=gen_edge).start()
    iothub_client_run()
    zmq_t = threading.Thread(target=gen_zmq)
    _open_cam()
    zmq_t.start()
    app.run(host="0.0.0.0", debug=False)


if __name__ == "__main__":
    main()
