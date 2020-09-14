import os
import threading
import cv2
import json
import time
import base64
import requests
import numpy as np

from shapely.geometry import Polygon
from exception_handler import PrintGetExceptionDetails
from azure.iot.device import IoTHubModuleClient

from onnxruntime_predict import ONNXRuntimeObjectDetection
from object_detection import ObjectDetection
from utility import get_file_zip, normalize_rtsp
from invoke import gm
#from tracker import Tracker
from scenarios import PartCounter, DefeatDetection, DangerZone, Detection

import logging

DETECTION_TYPE_NOTHING = 'nothing'
DETECTION_TYPE_SUCCESS = 'success'
DETECTION_TYPE_UNIDENTIFIED = 'unidentified'
DETECTION_BUFFER_SIZE = 10000

# for Retraining
UPLOAD_INTERVAL = 5

try:
    iot = IoTHubModuleClient.create_from_edge_environment()
except:
    iot = None

is_edge = False
try:
    IoTHubModuleClient.create_from_edge_environment()
    is_edge = True
except:
    pass


class Stream():
    def __init__(self, cam_id, model, sender, cam_type="video_file", cam_source='./sample_video/video.mp4'):
        self.cam_id = cam_id
        self.model = model

        self.render = False

        self.mutex = threading.Lock()

        self.cam_type = cam_type
        self.cam_source = None
        #self.cam = cv2.VideoCapture(normalize_rtsp(cam_source))
        self.cam_is_alive = True

        self.IMG_WIDTH = 960
        self.IMG_HEIGHT = 540
        self.image_shape = [540, 960]

        self.last_img = None
        #self.last_edge_img = None
        self.last_drawn_img = None
        self.last_prediction = []
        self.last_prediction_count = {}

        self.is_retrain = False
        self.confidence_min = 30 * 0.01
        self.confidence_max = 80 * 0.01
        self.max_images = 10
        self.last_upload_time = 0
        #self.is_upload_image = False
        #self.current_uploaded_images = {}

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
        self.use_line = False
        self.use_zone = False
        #self.tracker = Tracker()
        self.scenario = None
        self.scenario_type = None
        self.start_zmq()

    def _stop(self):
        gm.invoke_graph_instance_deactivate(self.cam_id)

    def _set(self, rtspUrl):
        gm.invoke_graph_grpc_instance_set(self.cam_id, rtspUrl)

    def _start(self):
        gm.invoke_graph_instance_activate(self.cam_id)

    def reset_metrics(self):
        self.mutex.acquire()
        self.detection_success_num = 0
        self.detection_unidentified_num = 0
        self.detection_total = 0
        self.detections = []
        self.tracker.reset_counter()
        self.mutex.release()

    def start_zmq(self):
        def run(self):

            while 'flags' not in dir(self.last_drawn_img):
                logging.info('not sending last_drawn_img')
                time.sleep(2)
            cnt = 0
            while self.cam_is_alive:
                cnt += 1
                if cnt % 30 == 1:
                    logging.info('send through channel {0}'.format(
                        bytes(self.cam_id, 'utf-8')))
                self.mutex.acquire()
                # FIXME may find a better way to deal with encoding
                self.zmq_sender.send_multipart([bytes(
                    self.cam_id, 'utf-8'), cv2.imencode(".jpg", self.last_drawn_img)[1].tobytes()])
                self.mutex.release()
                # FIXME need to fine tune this value
                time.sleep(0.08)
        threading.Thread(target=run, args=(self,)).start()

    def restart_cam(self):

        print('[INFO] Restarting Cam', flush=True)

        #cam = cv2.VideoCapture(normalize_rtsp(self.cam_source))

        # Protected by Mutex
        #self.mutex.acquire()
        #self.cam.release()
        #self.cam = cam
        #self.mutex.release()

    def update_cam(self, cam_type, cam_source, cam_id, has_aoi, aoi_info, scenario_type=None, line_info=None, zone_info=None):
        print('[INFO] Updating Cam ...', flush=True)

        #if self.cam_type == cam_type and self.cam_source == cam_source:
        #    return

        self.cam_source = cam_source
        self.has_aoi = has_aoi
        self.aoi_info = aoi_info

        if self.model.part_detection_mode == 'PC':
            print('[INFO] Line INFO', line_info, flush=True)
            self.scenario = DefeatDetection()
            self.scenario_type = self.model.part_detection_mode
            # FIXME
            scenario.set_ok('Bottle - OK')
            scenario.set_ng('Bottle - NG')
            try:
                line_info = json.loads(line_info)
                self.use_line = line_info['useCountingLine']
                lines = line_info['countingLines']
                if len(lines) > 0:
                    x1 = int(lines[0]['label'][0]['x'])
                    y1 = int(lines[0]['label'][0]['y'])
                    x2 = int(lines[0]['label'][1]['x'])
                    y2 = int(lines[0]['label'][1]['y'])
                    self.scenario.set_line(x1, y1, x2, y2)
                    print('Upading Line:', flush=True)
                    print('    use_line:', self.use_line, flush=True)
                    print('        line:', x1, y1, x2, y2, flush=True)
                else:
                    print('Upading Line:', flush=True)
                    print('    use_line:', self.use_line, flush=True)

            except:
                self.use_line = False
                print('Upading Line[*]:', flush=True)
                print('    use_line   :', False, flush=True)

        elif self.model.part_detection_mode == 'ES':
            print('[INFO] Zone INFO', zone_info, flush=True)
            self.scenario = DangerZone()
            self.scenario_type = self.model.part_detection_mode
            #FIXME
            scenario.set_targets(['person'])
            try:
                zone_info = json.loads(zone_info)
                self.use_zone = zone_info['useDangerZone']
                zones = zone_info['dangerZones']
                _zones = []
                print('Upading Line:', flush=True)
                print('    use_zone:', self.use_zone, flush=True)
                for zone in zones:
                    x1 = int(zones[0]['label'][0]['x'])
                    y1 = int(zones[0]['label'][0]['y'])
                    x2 = int(zones[0]['label'][1]['x'])
                    y2 = int(zones[0]['label'][1]['y'])
                    _zones.append([x1, y1, x2, y2])
                    print('     zone:', x1, y1, x2, y2, flush=True)
                self.scenario.set_zones(_zones)

            except:
                self.use_zone = False
                print('Upading Zone[*]:', flush=True)
                print('    use_zone   :', False, flush=True)

        elif self.model.part_detection_mode == 'DD':
            print('[INFO] Line INFO', line_info, flush=True)
            self.scenario = PartCounter()
            self.scenario_type = self.model.part_detection_mode
            try:
                line_info = json.loads(line_info)
                self.use_line = line_info['useCountingLine']
                lines = line_info['countingLines']
                if len(lines) > 0:
                    x1 = int(lines[0]['label'][0]['x'])
                    y1 = int(lines[0]['label'][0]['y'])
                    x2 = int(lines[0]['label'][1]['x'])
                    y2 = int(lines[0]['label'][1]['y'])
                    self.scenario.set_line(x1, y1, x2, y2)
                    print('Upading Line:', flush=True)
                    print('    use_line:', self.use_line, flush=True)
                    print('        line:', x1, y1, x2, y2, flush=True)
                else:
                    print('Upading Line:', flush=True)
                    print('    use_line:', self.use_line, flush=True)

            except:
                self.use_line = False
                print('Upading Line[*]:', flush=True)
                print('    use_line   :', False, flush=True)


        self._update_instance(normalize_rtsp(cam_source))


    def get_mode(self):
        return self.model.detection_mode


    def update_detection_status(self):
        self.mutex.acquire()
        detection_type = DETECTION_TYPE_NOTHING
        for prediction in self.last_prediction:
            if detection_type != DETECTION_TYPE_SUCCESS:
                if prediction['probability'] >= self.threshold:
                    detection_type = DETECTION_TYPE_SUCCESS
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

                self.detections.append(detection)
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

        self.mutex.release()

    def _update_instance(self, rtspUrl):
        self._stop()
        self._set(rtspUrl)
        self._start()
        logging.info("Instance {0} updated, rtsp = {1}".format(
            self.cam_id, rtspUrl))

    def update_retrain_parameters(self, is_retrain, confidence_min, confidence_max, max_images):
        self.is_retrain = is_retrain
        self.max_images = max_images
        #FIMXE may need to move it to other place
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
        self.mutex.acquire()
        self.cam_is_alive = False
        self.mutex.release()

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

        # prediction
        self.mutex.acquire()
        predictions, inf_time = self.model.Score(image)
        self.mutex.release()

        # check whether it's the tag we want
        predictions = list(p for p in predictions if p['tagName'] in self.model.parts)

        # check whether it's inside aoi (if has)
        if self.has_aoi:
            _predictions = []
            for p in predictions:
                (x1, y1), (x2, y2) = parse_bbox(p, width, height)
                if is_inside_aoi(x1, y1, x2, y2, self.aoi_info):
                    _predictions.append(p)
            predictions = _predictions

        # update the buffer
        # no need to copy since resize already did it
        self.last_img = image
        self.last_prediction = predictions

        # FIXME support more scenarios
        # Update Tracker / Scenario
        _detections = []
        for prediction in predictions:
            tag = prediction['tagName']
            if prediction['probability'] > 0.5:
                (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)
                _detections.append(Detection(tag, x1, y1, x2, y2, prediction['probability']))
        if self.scenario:
            self.scenario.update(_detections)


        self.update_detection_status()

        self.draw_img()

        if self.scenario:
            self.scenario.draw_counter(img)
            #FIXME close this
            self.scenario.draw_constraint(img)
            self.scenario.draw_objs(img)

        # update avg inference time (moving avg)
        inf_time_ms = inf_time * 1000
        self.average_inference_time = 1/16*inf_time_ms + 15/16*self.average_inference_time

        if self.is_retrain:
            self.process_retrain_image()

        if self.iothub_is_send:
            self.process_send_message_to_iothub()

    def process_retrain_image(self):
        for prediction in self.last_prediction:
            if self.last_upload_time + UPLOAD_INTERVAL < time.time():
                confidence = prediction['probability']
                print('comparing...', self.confidence_min, confidence, self.confidence_max, flush=True)
                if self.confidence_min <= confidence <= self.confidence_max:
                    print('preparing...', flush=True)
                    # prepare the data to send
                    tag = prediction['tagName']
                    img = self.last_img
                    height, width = img.shape[0], img.shape[1]
                    (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)
                    labels = json.dumps([{'x1': x1, 'x2': x2, 'y1': y1, 'y2': y2}])
                    jpg = cv2.imencode('.jpg', img)[1].tobytes()

                    send_retrain_image_to_webmodule(jpg, tag, labels, confidence)

                    self.last_upload_time = time.time()
                    break



    def process_send_message_to_iothub(self):
        if self.iothub_last_send_time + self.iothub_interval < time.time():
            predictions = []
            for p in self.last_prediction:
                if p['probability'] >= self.iothub_threshold:
                    predictions.append(p)
            send_message_to_iothub(predictions)
            self.iothub_last_send_time = time.time()


    def draw_img(self):

        img = self.last_img.copy()

        height, width = img.shape[0], img.shape[1]
        predictions = self.last_prediction

        if self.has_aoi:
            draw_aoi(img, self.aoi_info)

        for prediction in predictions:

            if prediction['probability'] > self.threshold:

                (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)
                img = cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 1)
                img = draw_confidence_level(img, prediction)

        #print('setting last drawn img', flush=True)
        if self.get_mode() == 'PC':
            if self.use_line:
                img = self.tracker.draw_line(img)
            img = self.tracker.draw_counter(img)

        self.last_drawn_img = img


def web_module_url():
    if is_edge:
        return 'WebModule:8000'
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

    font = cv2.FONT_HERSHEY_DUPLEX
    font_scale = 0.7
    thickness = 1

    prob_str = str(int(prediction['probability']*1000)/10)
    prob_str = ' (' + prob_str + '%)'

    (x1, y1), (x2, y2) = parse_bbox(prediction, width, height)

    img = cv2.putText(img, prediction['tagName']+prob_str,
                      (x1+10, y1-5), font, font_scale, (20, 20, 255), thickness)

    return img

def send_message_to_iothub(predictions):
    if iot:
        try:
            iot.send_message_to_output(
                json.dumps(predictions), 'metrics')
        except:
            print(
                '[ERROR] Failed to send message to iothub', flush=True)
        print(
            '[INFO] sending metrics to iothub', flush=True)
    else:
        #print('[METRICS]', json.dumps(predictions_to_send))
        pass

def send_retrain_image_to_webmodule(jpg, tag, labels, confidence):
    print('[INFO] Sending Image to relabeling', tag, flush=True)
    try:
        #requests.post('http://'+web_module_url()+'/api/relabel', data={
        res = requests.post('http://'+web_module_url()+'/api/part_detections/1/upload_relabel_image/', data={
            'confidence': confidence,
            'labels': labels,
            'part_name': tag,
            'is_relabel': True,
            'img': base64.b64encode(jpg)
        })
    except:
        print(
            '[ERROR] Failed to update image for relabeling', flush=True)
