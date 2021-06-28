import os
import io
import json
import datetime

import cv2
import grpc
import numpy as np
from flask import Flask, request, jsonify, Response
from tensorflow import make_tensor_proto, make_ndarray
from tensorflow_serving.apis import predict_pb2
from tensorflow_serving.apis import prediction_service_pb2_grpc

from common import load_classes, generate_colors, draw_outputs
from yolo_utils import yolo_eval


def preprocess(image):
    image = np.array(image, dtype=np.float32)
    image = cv2.resize(image, (416, 416))

    # switch from HWC to CHW
    # and reshape to (1, 3, size, size)
    # for model input requirements
    image = image.transpose(2, 0, 1).reshape(1, 3, 416, 416)

    return image


def postprocess(boxes, scores, classes, class_names):
    detectedObjects = []

    if len(classes) > 0:
        for i in range(len(classes)):
            idx = int(classes[i])
            temp = boxes[i] # xmin, ymin, xmax, ymax

            dobj = {
                "type" : "entity",
                "entity" : {
                    "tag" : {
                        "value" : class_names[idx],
                        "confidence" : str(scores[i].numpy())
                    },
                    "box" : {
                        "l" : str(temp[0].numpy()), # xmin
                        "t" : str(temp[1].numpy()), # ymax (from top)
                        "w" : str((temp[2]-temp[0]).numpy()), # xmax-xmin
                        "h" : str((temp[3]-temp[1]).numpy()) # ymax-ymin
                    }
                }
            }

            detectedObjects.append(dobj)

    return detectedObjects


def yolo_score(image):
    model_name = "yolov3"
    input_layer = "inputs"
    output_layers = [
        "detector/yolo-v3/Conv_14/BiasAdd/YoloRegion",
        "detector/yolo-v3/Conv_22/BiasAdd/YoloRegion",
        "detector/yolo-v3/Conv_6/BiasAdd/YoloRegion"
    ]
    class_names = load_classes("model_data/coco.names")
    results = {}

    print("Start processing:")
    print(f"\tModel name: {model_name}")

    with grpc.insecure_channel('ovms-server:9010') as channel:
        stub = prediction_service_pb2_grpc.PredictionServiceStub(channel)

        image = preprocess(image)

        request = predict_pb2.PredictRequest()
        request.model_spec.name = model_name
        request.inputs[input_layer].CopyFrom(
            make_tensor_proto(image, shape=(image.shape)))
        start_time = datetime.datetime.now()
        # result includes a dictionary with all model outputs
        result = stub.Predict(request, 10.0)
        end_time = datetime.datetime.now()

        yolo_outputs = [[], [], []]
        for output_layer in output_layers:
            output = make_ndarray(result.outputs[output_layer])
            output_numpy = np.array(output)
            anchor_size = output_numpy.shape[2]
            output_numpy = output_numpy.transpose(0, 2, 3, 1).reshape(
                1, anchor_size, anchor_size, 3, 85)
            yolo_outputs[int((anchor_size / 13) / 2)] = output_numpy

        scores, boxes, classes = yolo_eval(
            yolo_outputs,
            classes=80,
            score_threshold=0.5,
            iou_threshold=0.3
        )

        results = postprocess(boxes, scores, classes, class_names)

    return results


app = Flask(__name__)

# / routes to the default function which returns 'Hello World'
@app.route('/', methods=['GET'])
def defaultPage():
    return Response(response='Hello from Yolov3 inferencing based OVMS', status=200)

# /score routes to scoring function
# This function returns a JSON object with inference duration and detected objects
@app.route('/score', methods=['POST'])
def score():
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
        detectedObjects = yolo_score(cvImage)

        if len(detectedObjects) > 0:
            respBody = {
                "inferences" : detectedObjects
            }

            respBody = json.dumps(respBody)
            return Response(respBody, status= 200, mimetype ='application/json')
        else:
            return Response(status= 204)

    except Exception as err:
        return Response(response='[ERROR] Exception in score : {}'.format(repr(err)), status=500)


if __name__ == '__main__':
    # Run the server
    app.run(host='0.0.0.0', port=8888)
