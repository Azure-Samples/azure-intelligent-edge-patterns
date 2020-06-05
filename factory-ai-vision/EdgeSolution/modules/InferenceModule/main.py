import json
import time
import threading
import base64

import cv2
import numpy as np
import onnxruntime
from flask import Flask, request, Response
import requests

from azure.iot.device import IoTHubModuleClient

from object_detection import ObjectDetection
from utility import get_file_zip

MODEL_DIR = 'model'
UPLOAD_INTERVAL = 1 # sec

DETECTION_TYPE_NOTHING = 'nothing'
DETECTION_TYPE_SUCCESS = 'success'
DETECTION_TYPE_UNIDENTIFIED = 'unidentified'
DETECTION_BUFFER_SIZE = 10000

def is_edge():
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except:
        return False

def web_module_url():
    if is_edge(): return '172.18.0.1:8080'
    else: return 'localhost:8000'


def is_inside_aoi(x1, y1, x2, y2, aoi_info):
    return ( (onnx.aoi_info['x1'] <= x1 <= onnx.aoi_info['x2']) or (onnx.aoi_info['x1'] <= x2 <= onnx.aoi_info['x2']) ) and \
           ( (onnx.aoi_info['y1'] <= y1 <= onnx.aoi_info['y2']) or (onnx.aoi_info['y1'] <= y2 <= onnx.aoi_info['y2']) )

class ONNXRuntimeModelDeploy(ObjectDetection):
    """Object Detection class for ONNX Runtime
    """
    def __init__(self, model_dir, cam_type="video_file", cam_source="./sample_video/video.mp4"):
    #def __init__(self, model_dir, cam_type="rtsp", cam_source="rtsp://52.229.36.89:554/media/catvideo.mkv"):
        # Default system params
        self.render = False

        self.lock = threading.Lock()

        self.cam_type = cam_type
        self.cam_source = cam_source
        self.cam = cv2.VideoCapture(cam_source)

        self.model = self.load_model(model_dir)
        self.model_uri = None

        self.last_img = None
        self.last_prediction = []

        self.confidence_min = 30 * 0.01
        self.confidence_max = 80 * 0.01
        self.max_images = 10
        self.last_upload_time = 0
        self.is_upload_image = False
        self.current_uploaded_images = {}

        self.detection_success_num = 0
        self.detection_unidentified_num = 0
        self.detection_total = 0
        self.detections = []

        self.threshold = 0.4

        self.has_aoi = False
        self.aoi_info = None
        #json.loads("{\"useAOI\":true,\"AOIs\":[{\"x1\":100,\"y1\":216.36363636363637,\"x2\":614.909090909091,\"y2\":1762.181818181818}]}")['AOIs'][0]


    def restart_cam(self):

        print('[INFO] Restarting Cam')

        cam = cv2.VideoCapture(self.cam_source)

        # Protected by Mutex
        self.lock.acquire()
        self.cam.release()
        self.cam = cam
        self.lock.release()


    def update_cam(self, cam_type, cam_source, has_aoi, aoi_info):
        print('[INFO] Updating Cam ...')
        #print('  cam_type', cam_type)
        #print('  cam_source', cam_source)


        if cam_source == '0': cam_source = 0
        elif cam_source == '1': cam_source = 1
        elif cam_source == '2': cam_source = 2
        elif cam_source == '3': cam_source = 3

        if self.cam_type == cam_type and self.cam_source == cam_source: return

        self.cam_source = cam_source
        self.has_aoi    = has_aoi
        self.aoi_info   = aoi_info
        cam = cv2.VideoCapture(cam_source)

        # Protected by Mutex
        self.lock.acquire()
        self.cam.release()
        self.cam = cam
        self.lock.release()


    def load_model(self, model_dir):
        print('[INFO] Loading Model ...')

        model = None

        with open(model_dir + str('/cvexport.manifest')) as f:
            data = json.load(f)

        # FIXME to check whether we need to close the previous session
        if data['DomainType'] == 'ObjectDetection':
            model = ObjectDetection(data, model_dir, None)
            return model

        return None

    def update_retrain_parameters(self, confidence_min, confidence_max, max_images):
        self.confidence_min = confidence_min * 0.01
        self.confidence_max = confidence_max * 0.01
        self.max_images = max_imagese

    def update_model(self, model_dir):
        model = self.load_model( model_dir)

        # Protected by Mutex
        self.lock.acquire()
        self.model = model
        self.current_uploaded_images = {}
        self.is_upload_image = True

        self.detection_success_num = 0
        self.detection_unidentified_num = 0
        self.detection_total = 0 # nothing isn't included
        self.detections = []

        self.lock.release()


    def predict(self, image):

        self.lock.acquire()
        prediction, inf_time = self.model.predict_image(image)
        self.lock.release()

        return prediction



    def start_session(self):
        def run(self):
            while True:
                self.lock.acquire()
                b, img = self.cam.read()
                self.lock.release()

                if b:
                    self.last_img = img
                    self.last_prediction = self.predict(img)
                    #print(self.last_prediction)

                    height, width = img.shape[0], img.shape[1]

                    detection = DETECTION_TYPE_NOTHING
                    if True:
                        for prediction in self.last_prediction:
                            #print(prediction)
                            if self.last_upload_time + UPLOAD_INTERVAL < time.time():
                                x1 = int(prediction['boundingBox']['left'] * width)
                                y1 = int(prediction['boundingBox']['top'] * height)
                                x2 = x1 + int(prediction['boundingBox']['width'] * width)
                                y2 = y1 + int(prediction['boundingBox']['height'] * height)
                                labels = json.dumps([{'x1': x1, 'x2': x2, 'y1': y1, 'y2': y2}])

                                if self.has_aoi:
                                    if not is_inside_aoi(x1, y1, x2, y2, self.aoi_info): continue

                                if prediction['probability'] > self.confidence_max:
                                    detection = DETECTION_TYPE_SUCCESS
                                elif self.confidence_min <= prediction['probability'] <= self.confidence_max:

                                    if detection != DETECTION_TYPE_SUCCESS: detection = DETECTION_TYPE_UNIDENTIFIED

                                    tag = prediction['tagName']

                                    if self.is_upload_image:
                                        if tag in onnx.current_uploaded_images and self.current_uploaded_images[tag] >= onnx.max_images:
                                            pass
                                        else:
                                            self.current_uploaded_images[tag] = self.current_uploaded_images.get(tag, 0) + 1
                                            #print(tag, onnx.current_uploaded_images[tag], j) 
                                            self.last_upload_time = time.time()
                                            print('[INFO] Sending Image to relabeling', tag, onnx.current_uploaded_images[tag], labels)
                                            jpg = cv2.imencode('.jpg', img)[1].tobytes()
                                            try:
                                                requests.post('http://'+web_module_url()+'/api/relabel', data={
                                                    'confidence': prediction['probability'],
                                                    'labels': labels,
                                                    'part_name': tag,
                                                    'is_relabel': True,
                                                    'img': base64.b64encode(jpg)
                                                })
                                            except:
                                                print('[ERROR] Failed to update image for relabeling')

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
                    #print(detection)
                else:
                    if self.cam_type == 'video_file':
                        self.restart_cam()
                #print(self.last_prediction)
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
onnx = ONNXRuntimeModelDeploy(model_dir)
onnx.start_session()

app = Flask(__name__)
@app.route('/prediction', methods=['GET'])
def predict():
    #print(onnx.last_prediction)
    #onnx.last_prediction
    return json.dumps(onnx.last_prediction)

@app.route('/metrics', methods=['GET'])
def metrics():
    inference_num = onnx.detection_success_num
    unidentified_num = onnx.detection_unidentified_num
    total = onnx.detection_total
    if total == 0:
        success_rate = 0
    else:
        success_rate = inference_num * 100 / total 
    return json.dumps({
        'success_rate': success_rate,
        'inference_num': inference_num, 
        'unidentified_num': unidentified_num})

@app.route('/update_retrain_parameters')
def update_retrain_parameters():
    
    confidence_min = request.args.get('confidence_min')
    if not confidence_min: return 'missing confidence_min'

    confidence_max = request.args.get('confidence_max')
    if not confidence_max: return 'missing confidence_max'

    max_images = request.args.get('max_images')
    if not max_images: return 'missing max_images'

    self.confidence_min = int(confidence_min) * 0.01
    self.confidence_max = int(confidence_max) * 0.01
    self.max_images = int(max_images)

    return 'ok'

@app.route('/update_model')
def update_model():

    model_uri = request.args.get('model_uri')
    model_dir = request.args.get('model_dir')
    if not model_uri and not model_dir: return ('missing model_uri or model_dir')


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

    if not cam_type: return 'missing cam_type'
    if not cam_source: return 'missing cam_source'

    print('updating cam ...')
    print('  cam_type', cam_type)
    print('  cam_source', cam_source)

    aoi = request.args.get('aoi')
    try:
        aoi = json.loads(aoi)
        has_aoi = aoi['useAOI']
        aoi_info = aoi['AOIs'][0]
    except:
        has_aoi = False
        aoi_info = None

    print('  has_aoi', has_aoi)
    print('  aoi_info', aoi_info)

    onnx.update_cam(cam_type, cam_source, has_aoi, aoi_info)

    return 'ok'

@app.route('/update_threshold')
def update_threshold():
    threshold = float(request.args.get('threshold'))

    print('[INFO] update theshold to', threshold)

    onnx.threshold = threshold
    return 'ok'

@app.route('/video_feed')
def video_feed():
    inference = not not request.args.get('inference')
    print(inference)
    def _gen():
        while True:
            img = onnx.last_img.copy()
            if inference:
                #print('n')
                height, width = img.shape[0], img.shape[1]
                predictions = onnx.last_prediction
                #print(onnx.last_prediction)
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 1
                thickness = 3
                for prediction in predictions:
                    #print(prediction['tagName'], prediction['probability'])
                    #print(onnx.last_upload_time, time.time())

                    if onnx.has_aoi:
                        img = cv2.rectangle(img, (int(onnx.aoi_info['x1']), int(onnx.aoi_info['y1'])), (int(onnx.aoi_info['x2']), int(onnx.aoi_info['y2'])), (0, 255, 255), 2)

                    if prediction['probability'] > onnx.threshold:
                        x1 = int(prediction['boundingBox']['left'] * width)
                        y1 = int(prediction['boundingBox']['top'] * height)
                        x2 = x1 + int(prediction['boundingBox']['width'] * width)
                        y2 = y1 + int(prediction['boundingBox']['height'] * height)
                        if onnx.has_aoi:
                            if not is_inside_aoi(x1, y1, x2, y2, onnx.aoi_info): continue

                        img = cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 2)
                        img = cv2.putText(img, prediction['tagName'], (x1+10, y1+30), font, font_scale, (0, 0, 255), thickness)


            #time.sleep(0.03)
            yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + cv2.imencode('.jpg', img)[1].tobytes() + b'\r\n')

    return Response(_gen(),
            mimetype='multipart/x-mixed-replace; boundary=frame')

# for debugging
#onnx.update_cam(cam_type='rtsp', cam_source='sample_video/video.mp4', has_aoi=True, aoi_info={'x1': 100, 'x2': 1000, 'y1': 100, 'y2': 500})
#requests.get('http://localhost:5000/update_cam', params={'cam_type':'rtsp', 'cam_source':'0', 'aoi':'{\"useAOI\":true,\"AOIs\":[{\"x1\":100,\"y1\":216.36363636363637,\"x2\":3314.909090909091,\"y2\":1762.181818181818}]}'})


def main():

    app.run(host='0.0.0.0', debug=False)

if __name__ == '__main__':
    main()
