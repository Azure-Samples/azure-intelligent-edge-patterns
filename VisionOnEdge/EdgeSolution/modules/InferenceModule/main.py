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

def is_edge():
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except:
        return False

def web_module_url():
    if is_edge(): return '172.18.0.1:8080'
    else: return 'localhost:8000'


class ONNXRuntimeModelDeploy(ObjectDetection):
    """Object Detection class for ONNX Runtime
    """
    def __init__(self, model_dir, cam_type="video_file", cam_source="./sample_video/video.mp4"):
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

        self.inference_num = 0
        self.unidentified_num = 0


    def restart_cam(self):

        print('[INFO] Restarting Cam')

        cam = cv2.VideoCapture(self.cam_source)

        # Protected by Mutex
        self.lock.acquire()
        self.cam.release()
        self.cam = cam
        self.lock.release()


    def update_cam(self, cam_type, cam_source):
        print('[INFO] Updating Cam ...')
        #print('  cam_type', cam_type)
        #print('  cam_source', cam_source)


        if cam_source == '0': cam_source = 0
        elif cam_source == '1': cam_source = 1
        elif cam_source == '2': cam_source = 2
        elif cam_source == '3': cam_source = 3

        if self.cam_type == cam_type and self.cam_source == cam_source: return

        self.cam_source = cam_source
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


    def update_model(self, model_dir):
        model = self.load_model( model_dir)

        # Protected by Mutex
        self.lock.acquire()
        self.model = model
        self.current_uploaded_images = {}
        self.is_upload_image = True
        self.lock.release()

        self.inference_num = 0
        self.unidentified_num = 0


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

                    height, width = img.shape[0], img.shape[1]

                    detection = 'nothing'
                    if True:
                        for prediction in self.last_prediction:
                            #print(prediction)
                            if self.last_upload_time + UPLOAD_INTERVAL < time.time():
                                if prediction['probability'] > self.confidence_max:
                                    detection = 'success'
                                elif self.confidence_min <= prediction['probability'] <= self.confidence_max:

                                    if detection != 'success': detection = 'unidentified'

                                    tag = prediction['tagName']

                                    if self.is_upload_image:
                                        if tag in onnx.current_uploaded_images and self.current_uploaded_images[tag] >= onnx.max_images:
                                            pass
                                        else:
                                            x1 = int(prediction['boundingBox']['left'] * width)
                                            y1 = int(prediction['boundingBox']['top'] * height)
                                            x2 = x1 + int(prediction['boundingBox']['width'] * width)
                                            y2 = y1 + int(prediction['boundingBox']['height'] * height)
                                            labels = json.dumps([{'x1': x1, 'x2': x2, 'y1': y1, 'y2': y2}])
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

                    if detection == 'success':
                        self.inference_num += 1
                    elif detection == 'unidentified':
                        self.unidentified_num += 1
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
    return json.dumps({'inference_num': onnx.inference_num, 'unidentified_num': onnx.unidentified_num})

@app.route('/update_model')
def update_model():

    model_uri = request.args.get('model_uri')
    if not model_uri: return ('missing model_uri')

    print('[INFO] Update Model ...')

    if model_uri == onnx.model_uri:
        print('[INFO] Model Uri unchanged')
        return 'ok'

    get_file_zip(model_uri, MODEL_DIR)
    onnx.model_uri = model_uri

    onnx.update_model('model')
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
    onnx.update_cam(cam_type, cam_source)

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
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 1
                thickness = 3
                for prediction in predictions:
                    #print(prediction['tagName'], prediction['probability'])
                    #print(onnx.last_upload_time, time.time())

                    if prediction['probability'] > 0.5:
                        x1 = int(prediction['boundingBox']['left'] * width)
                        y1 = int(prediction['boundingBox']['top'] * height)
                        x2 = x1 + int(prediction['boundingBox']['width'] * width)
                        y2 = y1 + int(prediction['boundingBox']['height'] * height)
                        img = cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 2)
                        img = cv2.putText(img, prediction['tagName'], (x1+10, y1+30), font, font_scale, (0, 0, 255), thickness)


            #time.sleep(0.03)
            yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + cv2.imencode('.jpg', img)[1].tobytes() + b'\r\n')

    return Response(_gen(),
            mimetype='multipart/x-mixed-replace; boundary=frame')

def main():

    app.run(host='0.0.0.0', debug=False)

if __name__ == '__main__':
    main()
