import json
import time
import threading
import base64
import zmq

import cv2
import numpy as np
import onnxruntime
from flask import Flask, request, Response
import requests
from shapely.geometry import Polygon

from azure.iot.device import IoTHubModuleClient

from object_detection import ObjectDetection
from onnxruntime_predict import ONNXRuntimeObjectDetection
from utility import get_file_zip, normalize_rtsp

MODEL_DIR = 'model'
UPLOAD_INTERVAL = 1  # sec

DETECTION_TYPE_NOTHING = 'nothing'
DETECTION_TYPE_SUCCESS = 'success'
DETECTION_TYPE_UNIDENTIFIED = 'unidentified'
DETECTION_BUFFER_SIZE = 10000

IMG_WIDTH = 960
IMG_HEIGHT = 540


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
                p2 = (label[(index+1)%l]['x'], label[(index+1)%l]['y'])
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


class ONNXRuntimeModelDeploy(ObjectDetection):
    """Object Detection class for ONNX Runtime
    """

    def __init__(self, model_dir, cam_type="video_file", cam_source="./sample_video/video.mp4"):
        # def __init__(self, model_dir, cam_type="video_file", cam_source="./mov_bbb.mp4"):
        # def __init__(self, model_dir, cam_type="video_file", cam_source="./sample_video/video_1min.mp4"):
        # def __init__(self, model_dir, cam_type="rtsp", cam_source="rtsp://52.229.36.89:554/media/catvideo.mkv"):
        # Default system params
        self.render = False

        self.lock = threading.Lock()

        self.cam_type = cam_type
        self.cam_source = cam_source
        self.cam = cv2.VideoCapture(normalize_rtsp(cam_source))

        self.model = self.load_model(model_dir, is_default_model=True)
        self.model_uri = None

        self.last_img = None
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

        self.is_gpu = (onnxruntime.get_device() == 'GPU')
        self.average_inference_time = 0

        # IoT Hub
        self.iothub_is_send = False
        self.iothub_threshold = 0.5
        self.iothub_fpm = 0
        self.iothub_last_send_time = time.time()
        self.iothub_interval = 99999999
        #self.iothub_is_send = True
        #self.iothub_threshold = 0.8
        #self.iothub_fpm = 1
        #self.iothub_last_send_time = time.time()
        #self.iothub_interval = 5

    def restart_cam(self):

        print('[INFO] Restarting Cam')

        cam = cv2.VideoCapture(normalize_rtsp(self.cam_source))

        # Protected by Mutex
        self.lock.acquire()
        self.cam.release()
        self.cam = cam
        self.lock.release()

    def update_parts(self, parts):
        print('[INFO] Updating Parts ...', parts)
        self.parts = parts

    def update_cam(self, cam_type, cam_source, has_aoi, aoi_info):
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

    def load_model(self, model_dir, is_default_model):
        if is_default_model:
            print('[INFO] Loading Default Model ...')

            model = None

            with open(model_dir + str('/cvexport.manifest')) as f:
                data = json.load(f)

            # FIXME to check whether we need to close the previous session
            if data['DomainType'] == 'ObjectDetection':
                model = ObjectDetection(data, model_dir, None)
                return model

        else:
            print('[INFO] Loading Default Model ...')
            with open('model/labels.txt', 'r') as f:
                labels = [l.strip() for l in f.readlines()]
            model = ONNXRuntimeObjectDetection('model/model.onnx', labels)

            return model

        return None

    def update_retrain_parameters(self, confidence_min, confidence_max, max_images):
        self.confidence_min = confidence_min * 0.01
        self.confidence_max = confidence_max * 0.01
        self.max_images = max_imagese
        self.threshold = self.confidence_max

    def update_model(self, model_dir):
        is_default_model = ('default_model' in model_dir)
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
        self.lock.release()

        inf_time_ms = inf_time * 1000
        self.average_inference_time = 1/16*inf_time_ms + 15/16*self.average_inference_time

        return prediction

    def start_session(self):
        def run(self):
            send_counter = 0
            while True:
                self.lock.acquire()
                b, img = self.cam.read()

                if b:
                    width = IMG_WIDTH
                    ratio = IMG_WIDTH / img.shape[1]
                    height = int(img.shape[0] * ratio + 0.000001)
                    if height >= IMG_HEIGHT:
                        height = IMG_HEIGHT
                        ratio = IMG_HEIGHT / img.shape[0]
                        width = int(img.shape[1] * ratio + 0.000001)

                    img = cv2.resize(img, (width, height))

                self.lock.release()

                # if b is false, restart the video if the type is video
                if b:
                    self.last_img = img
                    self.last_prediction = self.predict(img)
                    # print(self.last_prediction)
                    last_prediction_count = {}

                    height, width = img.shape[0], img.shape[1]

                    detection = DETECTION_TYPE_NOTHING
                    if True:
                        send_counter += 1
                        if self.iothub_is_send:
                            if self.iothub_last_send_time + self.iothub_interval < time.time():
                                predictions_to_send = []
                                for prediction in self.last_prediction:
                                    _tag = prediction['tagName']
                                    _p = prediction['probability']
                                    if _tag not in self.parts:
                                        continue
                                    if _p < self.iothub_threshold:
                                        continue
                                    x1 = int(
                                        prediction['boundingBox']['left'] * width)
                                    y1 = int(
                                        prediction['boundingBox']['top'] * height)
                                    x2 = x1 + \
                                        int(prediction['boundingBox']
                                            ['width'] * width)
                                    y2 = y1 + \
                                        int(prediction['boundingBox']
                                            ['height'] * height)
                                    x1 = min(max(x1, 0), width-1)
                                    x2 = min(max(x2, 0), width-1)
                                    y1 = min(max(y1, 0), height-1)
                                    y2 = min(max(y2, 0), height-1)
                                    if self.has_aoi:
                                        if not is_inside_aoi(x1, y1, x2, y2, self.aoi_info):
                                            continue

                                    predictions_to_send.append(prediction)
                                if len(predictions_to_send) > 0:
                                    if iot:
                                        try:
                                            iot.send_message_to_output(
                                                json.dumps(predictions_to_send), 'metrics')
                                        except:
                                            print(
                                                '[ERROR] Failed to send message to iothub', flush=True)
                                        print(
                                            '[INFO] sending metrics to iothub')
                                    else:
                                        #print('[METRICS]', json.dumps(predictions_to_send))
                                        pass
                                    self.iothub_last_send_time = time.time()

                        for prediction in self.last_prediction:

                            tag = prediction['tagName']
                            if tag not in self.parts:
                                continue

                            if prediction['probability'] > self.threshold:
                                if tag not in last_prediction_count: last_prediction_count[tag] = 1
                                else: last_prediction_count[tag] += 1

                            (x1, y1), (x2, y2) = parse_bbox(
                                prediction, width, height)
                            if self.has_aoi:
                                if not is_inside_aoi(x1, y1, x2, y2, self.aoi_info):
                                    continue

                            if detection != DETECTION_TYPE_SUCCESS:
                                if prediction['probability'] >= self.threshold:
                                    detection = DETECTION_TYPE_SUCCESS
                                else:
                                    detection = DETECTION_TYPE_UNIDENTIFIED

                            if self.last_upload_time + UPLOAD_INTERVAL < time.time():
                                if self.confidence_min <= prediction['probability'] <= self.confidence_max:
                                    if self.is_upload_image:
                                        # if tag in onnx.current_uploaded_images and self.current_uploaded_images[tag] >= onnx.max_images:
                                        # if tag in onnx.current_uploaded_images:
                                        # No limit for the max_images in inference module now, the logic is moved to webmodule
                                        #    pass
                                        # else:
                                        if True:

                                            labels = json.dumps(
                                                [{'x1': x1, 'x2': x2, 'y1': y1, 'y2': y2}])
                                            print('[INFO] Sending Image to relabeling', tag, onnx.current_uploaded_images.get(
                                                tag, 0), labels)
                                            #self.current_uploaded_images[tag] = self.current_uploaded_images.get(tag, 0) + 1
                                            self.last_upload_time = time.time()

                                            jpg = cv2.imencode('.jpg', img)[
                                                1].tobytes()
                                            try:
                                                requests.post('http://'+web_module_url()+'/api/relabel', data={
                                                    'confidence': prediction['probability'],
                                                    'labels': labels,
                                                    'part_name': tag,
                                                    'is_relabel': True,
                                                    'img': base64.b64encode(jpg)
                                                })
                                            except:
                                                print(
                                                    '[ERROR] Failed to update image for relabeling')

                    self.last_prediction_count = last_prediction_count

                    self.lock.acquire()
                    if detection == DETECTION_TYPE_NOTHING:
                        pass
                    else:
                        if self.detection_total == DETECTION_BUFFER_SIZE:
                            oldest_detection = self.detections.pop(0)
                            if oldest_detection == DETECTION_TYPE_UNIDENTIFIED:
                                self.detection_unidentified_num -= 1
                            elif oldest_detection == DETECTION_TYPE_SUCCESS:
                                self.detection_success_num -= 1

                            self.detections.append(detection)
                            if detection == DETECTION_TYPE_UNIDENTIFIED:
                                self.detection_unidentified_num += 1
                            elif detection == DETECTION_TYPE_SUCCESS:
                                self.detection_success_num += 1
                        else:
                            self.detections.append(detection)
                            if detection == DETECTION_TYPE_UNIDENTIFIED:
                                self.detection_unidentified_num += 1
                            elif detection == DETECTION_TYPE_SUCCESS:
                                self.detection_success_num += 1
                            self.detection_total += 1

                    self.lock.release()
                    # print(detection)
                else:
                    if self.cam_type == 'video_file':
                        self.restart_cam()
                # print(self.last_prediction)
                if self.cam_type == 'video_file':
                    time.sleep(0.01)

        self.session = threading.Thread(target=run, args=(self,))
        self.session.start()

    def local_test(self):
        cap = cv2.VideoCapture(0)
        while True:
            _, img = cap.read()
            cv2.imshow('img', img)
            res = self.predict(img)
            print(res)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break


model_dir = './default_model'
#model_dir = './default_model_6parts'
onnx = ONNXRuntimeModelDeploy(model_dir)
onnx.start_session()

app = Flask(__name__)
@app.route('/prediction', methods=['GET'])
def prediction():
    # print(onnx.last_prediction)
    # onnx.last_prediction
    return json.dumps(onnx.last_prediction)

@app.route('/predict', methods=['POST'])
def predict():
    #print(request.data)
    nparr = np.frombuffer(request.data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    predictions = onnx.predict(img)
    results = []
    for prediction in predictions:
        tag_name = prediction['tagName']
        if tag_name not in onnx.parts: continue
        confidence = prediction['probability']
        box = {
            'l': prediction['boundingBox']['left'],
            't': prediction['boundingBox']['top'],
            'w': prediction['boundingBox']['width'],
            'h': prediction['boundingBox']['height'],
        }
        results.append({
            'type': 'entity',
            'entity': {
                'tag': {'value': tag_name, 'confidence': confidence},
                'box': box
            }
        })

    if len(results) > 0:
        return json.dumps({'inferences': results}), 200
    return '', 204

@app.route('/metrics', methods=['GET'])
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
    return json.dumps({
        'success_rate': success_rate,
        'inference_num': inference_num,
        'unidentified_num': unidentified_num,
        'is_gpu': is_gpu,
        'average_inference_time': average_inference_time,
        'last_prediction_count': last_prediction_count
    })


@app.route('/update_retrain_parameters')
def update_retrain_parameters():

    confidence_min = request.args.get('confidence_min')
    if not confidence_min:
        return 'missing confidence_min'

    confidence_max = request.args.get('confidence_max')
    if not confidence_max:
        return 'missing confidence_max'

    max_images = request.args.get('max_images')
    if not max_images:
        return 'missing max_images'

    onnx.confidence_min = int(confidence_min) * 0.01
    onnx.confidence_max = int(confidence_max) * 0.01
    onnx.max_images = int(max_images)

    print('[INFO] updaing retrain parameters to')
    print('  conficen_min:', confidence_min)
    print('  conficen_max:', confidence_max)
    print('  max_images  :', max_images)

    return 'ok'


@app.route('/update_model')
def update_model():

    model_uri = request.args.get('model_uri')
    model_dir = request.args.get('model_dir')
    if not model_uri and not model_dir:
        return ('missing model_uri or model_dir')

    print('[INFO] Update Model ...')
    if model_uri:

        print('[INFO] Got Model URI', model_uri)

        if model_uri == onnx.model_uri:
            print('[INFO] Model Uri unchanged')
        else:
            get_file_zip(model_uri, MODEL_DIR)
            onnx.model_uri = model_uri

        onnx.update_model('model')
        print('[INFO] Update Finished ...')

        return 'ok'

    elif model_dir:
        print('[INFO] Got Model DIR', model_dir)
        onnx.update_model(model_dir)
        print('[INFO] Update Finished ...')
        return 'ok'


@app.route('/update_cam')
def update_cam():

    cam_type = request.args.get('cam_type')
    cam_source = request.args.get('cam_source')

    if not cam_type:
        return 'missing cam_type'
    if not cam_source:
        return 'missing cam_source'

    print('updating cam ...')
    print('  cam_type', cam_type)
    print('  cam_source', cam_source)

    aoi = request.args.get('aoi')
    try:
        aoi = json.loads(aoi)
        has_aoi = aoi['useAOI']
        aoi_info = aoi['AOIs']
    except:
        has_aoi = False
        aoi_info = None

    print('  has_aoi', has_aoi)
    print('  aoi_info', aoi_info)

    onnx.update_cam(cam_type, cam_source, has_aoi, aoi_info)

    return 'ok'


@app.route('/update_parts')
def update_parts():
    try:
        print('----Upadate parts----')
        parts = request.args.getlist('parts')
        print('[INFO] Updating parts', parts)
        self.parts = parts
        print('[INFO] Updated parts', parts)
    except:
        print('[ERROR] Unknown format', parts)
        # return 'unknown format'

    onnx.update_parts(parts)

    return 'ok'

# @app.route('/update_threshold')
# def update_threshold():
#    print('[WARNING] is depreciated')
#    return 'ok'


@app.route('/update_iothub_parameters')
def update_iothub_parameters():
    is_send = request.args.get('is_send')
    threshold = request.args.get('threshold')
    fpm = request.args.get('fpm')

    if not is_send:
        return 'missing is_send'
    if not threshold:
        return 'missing threshold'
    if not fpm:
        return 'missing fpm'

    is_send = (is_send == 'True')
    threshold = int(threshold) * 0.01
    fpm = int(fpm)

    print('updating iothub parameters ...')
    print('  is_send', is_send)
    print('  threshold', threshold)
    print('  fpm', fpm)

    onnx.update_iothub_parameters(is_send, threshold, fpm)
    return 'ok'


@app.route('/update_prob_threshold')
def update_prob_threshold():
    prob_threshold = request.args.get('prob_threshold')
    if not prob_threshold:
        return 'missing prob_threshold'

    onnx.threshold = int(prob_threshold) * 0.01
    print('[INFO] updaing prob_threshold to')
    print('  prob_threshold:', prob_threshold)

    onnx.lock.acquire()
    onnx.detection_success_num = 0
    onnx.detection_unidentified_num = 0
    onnx.detection_total = 0
    onnx.detections = []
    onnx.lock.release()

    return 'ok'


@app.route('/video_feed')
def video_feed():
    inference = not not request.args.get('inference')
    print(inference)

    def _gen():
        while True:
            img = onnx.last_img.copy()
            if inference:
                height, width = img.shape[0], img.shape[1]
                predictions = onnx.last_prediction
                for prediction in predictions:
                    tag = prediction['tagName']
                    # if tag not in onnx.parts:
                    #     continue

                    if onnx.has_aoi:
                        #for aoi_area in onnx.aoi_info:
                            #img = cv2.rectangle(img, (int(aoi_area['x1']), int(aoi_area['y1'])), (int(
                            #    aoi_area['x2']), int(aoi_area['y2'])), (0, 255, 255), 2)
                        draw_aoi(img, onnx.aoi_info)

                    if prediction['probability'] > onnx.threshold:
                        (x1, y1), (x2, y2) = parse_bbox(
                            prediction, width, height)
                        if onnx.has_aoi:
                            if not is_inside_aoi(x1, y1, x2, y2, onnx.aoi_info):
                                continue

                        img = cv2.rectangle(
                            img, (x1, y1), (x2, y2), (0, 0, 255), 2)
                        img = draw_confidence_level(img, prediction)

            time.sleep(0.02)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + cv2.imencode('.jpg', img)[1].tobytes() + b'\r\n')
    return Response(_gen(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# if inference = true


def gen():

    while 'flags' not in dir(onnx.last_img):
        print('not sending')
        time.sleep(1)

    while True:
        img = onnx.last_img.copy()

        height, width = img.shape[0], img.shape[1]
        predictions = onnx.last_prediction
        for prediction in predictions:
            tag = prediction['tagName']
            # if tag not in onnx.parts:
            #     continue

            if onnx.has_aoi:
                #for aoi_area in onnx.aoi_info:
                    #img = cv2.rectangle(img, (int(aoi_area['x1']), int(aoi_area['y1'])), (int(
                    #    aoi_area['x2']), int(aoi_area['y2'])), (0, 255, 255), 2)
                draw_aoi(img, onnx.aoi_info)

            if prediction['probability'] > onnx.threshold:
                (x1, y1), (x2, y2) = parse_bbox(
                    prediction, width, height)
                if onnx.has_aoi:
                    if not is_inside_aoi(x1, y1, x2, y2, onnx.aoi_info):
                        continue

                img = cv2.rectangle(
                    img, (x1, y1), (x2, y2), (0, 0, 255), 2)
                img = draw_confidence_level(img, prediction)
        onnx.last_drawn_img = img

        time.sleep(0.02)


def gen_zmq():
    context = zmq.Context()
    sender = context.socket(zmq.PUSH)
    # sender.connect("tcp://localhost:5558")
    sender.bind("tcp://*:5558")

    while 'flags' not in dir(onnx.last_drawn_img):
        print('not sending')
        time.sleep(1)
    cnt = 0
    while True:
        cnt += 1
        sender.send_pyobj(
            {"data": cv2.imencode(".jpg", onnx.last_drawn_img)[1].tobytes(), "ts": str(cnt), "shape": (540, 960, 3)})
        # sender.send(cv2.imencode(".jpg", onnx.last_img)[1].tostring())
        # time.sleep(2)
        time.sleep(0.04)


def main():
    threading.Thread(target=gen).start()
    zmq_t = threading.Thread(target=gen_zmq)
    zmq_t.start()
    app.run(host='0.0.0.0', debug=False)


if __name__ == '__main__':
    main()
