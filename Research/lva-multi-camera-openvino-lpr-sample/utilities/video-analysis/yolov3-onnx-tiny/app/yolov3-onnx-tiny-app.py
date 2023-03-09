# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import threading
import cv2
import numpy as np
import io
import onnxruntime
import json

# Imports for the REST API
from flask import Flask, request, jsonify, Response

class YoloV3TinyModel:
    def __init__(self):
        self._lock = threading.Lock()

        with open('coco_classes.txt', "r") as f:
            self._labelList = [l.rstrip() for l in f]

        self._onnxSession = onnxruntime.InferenceSession('tiny-yolov3-11.onnx')

    def Preprocess(self, cvImage):
        imageBlob = cv2.cvtColor(cvImage, cv2.COLOR_BGR2RGB)
        imageBlob = np.array(imageBlob, dtype='float32')
        imageBlob /= 255.
        imageBlob = np.transpose(imageBlob, [2, 0, 1])
        imageBlob = np.expand_dims(imageBlob, 0)

        return imageBlob

    def Postprocess(self, boxes, scores, indices):
        detectedObjects = []

        for idx in indices[0]:
            idxTuple = (idx[0], idx[2])
            temp = [i for i in boxes[idxTuple]]  # temp[1, 0, 3, 2] = xmin, ymin, xmax, ymax
            dobj = {
                "type" : "entity",
                "entity" : {
                    "tag" : {
                        "value" : self._labelList[idx[1]],
                        "confidence" : str(scores[tuple(idx)])
                    },
                    "box" : {
                        "l" : str(temp[1] / 416),
                        "t" : str(temp[0] / 416),
                        "w" : str((temp[3] - temp[1]) / 416),
                        "h" : str((temp[2] - temp[0]) / 416)
                    }
                }
            }
            detectedObjects.append(dobj)

        return detectedObjects

    def Score(self, cvImage):
        with self._lock:
            imageBlob = self.Preprocess(cvImage)
            boxes, scores, indices = self._onnxSession.run(None, {"input_1": imageBlob, "image_shape":np.array([[416, 416]], dtype=np.float32)})
    
        return self.Postprocess(boxes, scores, indices)


# global ml model class
yolo = YoloV3TinyModel()

app = Flask(__name__)

# / routes to the default function which returns 'Hello World'
@app.route('/', methods=['GET'])
def defaultPage():
    return Response(response='Hello from Tiny Yolov3 inferencing based on ONNX', status=200)

# /score routes to scoring function 
# This function returns a JSON object with inference duration and detected objects
@app.route('/score', methods=['POST'])
def score():
    global yolo
    try:
        # get request as byte stream
        reqBody = request.get_data(False)

        # convert from byte stream
        inMemFile = io.BytesIO(reqBody)

        # load a sample image
        inMemFile.seek(0)
        fileBytes = np.asarray(bytearray(inMemFile.read()), dtype=np.uint8)

        cvImage = cv2.imdecode(fileBytes, cv2.IMREAD_COLOR)

        # Infer Image
        detectedObjects = yolo.Score(cvImage)

        if len(detectedObjects) > 0:
            respBody = {                    
                        "inferences" : detectedObjects
                    }

            respBody = json.dumps(respBody)
            return Response(respBody, status= 200, mimetype ='application/json')
        else:
            return Response(status= 204)

    except:
        return Response(response='Error processing image', status=500)

if __name__ == '__main__':
    # Run the server
    app.run(host='0.0.0.0', port=8888)
