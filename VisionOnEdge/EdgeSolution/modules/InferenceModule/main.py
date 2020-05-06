import json
import time
import threading

import cv2
import numpy as np
import onnxruntime
from flask import Flask, request, Response
import requests

from object_detection import ObjectDetection
from utility import get_file_zip

MODEL_DIR = 'model'


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

        self.last_img = None
        self.last_prediction = []

    def restart_cam(self):

        print('[INFO] Restarting Cam')

        cam = cv2.VideoCapture(self.cam_source)

        # Protected by Mutex
        self.lock.acquire()
        self.cam.release()
        self.cam = cam
        self.lock.release()


    def load_model(self, model_dir):

        model = None

        with open(model_dir + str('/cvexport.manifest')) as f:
            data = json.load(f)


    def update_cam(self, cam_type, cam_source):
        print('[INFO] Updating Cam ...')
        #print('  cam_type', cam_type)
        #print('  cam_source', cam_source)

        self.cam_type = cam_type

        if cam_source == '0': cam_source = 0
        elif cam_source == '1': cam_source = 1
        elif cam_source == '2': cam_source = 2
        elif cam_source == '3': cam_source = 3

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
    print(onnx.last_prediction)
    #onnx.last_prediction
    return json.dumps(onnx.last_prediction)

@app.route('/update_model')
def update_model():

    model_uri = request.args.get('model_uri')
    if not model_uri: return ('missing model_uri')

    print('[INFO] Update Model ...')

    get_file_zip(model_uri, MODEL_DIR)

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
                    if prediction['probability'] > 0.7 and prediction['tagName'] == 'hat':
                        x1 = int(prediction['boundingBox']['left'] * width)
                        y1 = int(prediction['boundingBox']['top'] * height)
                        x2 = x1 + int(prediction['boundingBox']['width'] * width)
                        y2 = y1 + int(prediction['boundingBox']['height'] * height)
                        #print(x1, y1, x2, y2)
                        img = cv2.rectangle(img, (x1, y1), (x2, y2), (255, 0, 0), 2)
                        img = cv2.putText(img, prediction['tagName'], (x1+10, y1+30), font, font_scale, (255, 0, 0), thickness)
                    if prediction['probability'] > 0.4 and prediction['tagName'] == 'person':
                        x1 = int(prediction['boundingBox']['left'] * width)
                        y1 = int(prediction['boundingBox']['top'] * height)
                        x2 = x1 + int(prediction['boundingBox']['width'] * width)
                        y2 = y1 + int(prediction['boundingBox']['height'] * height)
                        #print(x1, y1, x2, y2)
                        img = cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 2)
                        img = cv2.putText(img, prediction['tagName'], (x1+10, y1+30), font, font_scale, (0, 0, 255), thickness)


            #time.sleep(0.03)
            yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + cv2.imencode('.jpg', img)[1].tobytes() + b'\r\n')

    return Response(_gen(),
            mimetype='multipart/x-mixed-replace; boundary=frame')

def main():

    app.run(host='0.0.0.0')

if __name__ == '__main__':
    main()
