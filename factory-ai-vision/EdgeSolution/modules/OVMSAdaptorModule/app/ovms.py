import grpc
import cv2
import os
import numpy as np
from tensorflow import make_tensor_proto, make_ndarray
import argparse
from tensorflow_serving.apis import predict_pb2
from tensorflow_serving.apis import prediction_service_pb2_grpc



def connect_ovms(address):
    channel = grpc.insecure_channel(address)
    stub = prediction_service_pb2_grpc.PredictionServiceStub(channel)
    return stub

def predict(stub, img):
    request = predict_pb2.PredictRequest()
    #FIXME name
    request.model_spec.name = 'Default Cascade'

    request.inputs['image'].CopyFrom(make_tensor_proto(img, shape=img.shape))

    response = None
    try:
        response = stub.Predict(request, 30.0)
    except grpc.RpcError as err:
        if err.code() == grpc.StatusCode.ABORTED:
            #print('No face has been found in the image')
            #exit(1)
            pass
        else:
            raise err
    
    return response


while False:
    b, frame = cap.read()
    if not b: break
    frame = cv2.imread('../2people.jpeg')
    img = frame.astype(np.float32)
    img = cv2.resize(img, (416, 416))
    img = img.reshape((1, 416, 416, 3))
    response = predict(ovms, img)
    #print(response)
    #from IPython import embed; embed()

    if response is None: continue
    coordinates = make_ndarray(response.outputs['coordinates'])
    confidences = make_ndarray(response.outputs['confidences'])

    is_ages = False
    is_emotions = False
    is_genders = False

    if 'ages' in response.outputs:
        ages = make_ndarray(response.outputs['ages'])
        is_ages = True

    if 'genders' in response.outputs:
        genders = make_ndarray(response.outputs['genders'])
        is_genders = True

    if 'emotions' in response.outputs:
        emotions = make_ndarray(response.outputs['emotions'])
        is_emotions = True

    n = coordinates.shape[0]
    results = []
    for i in range(n):
        x1, y1, x2, y2 = coordinates[i,0]
        result = {
            'tag': 'person',
            'attributes': [],
            'box': {
                'l': x1,
                't': y1,
                'w': x2-x1,
                'h': y2-y1
            }
        }
        emotion_label =  ('neutral', 'happy', 'sad', 'surprise', 'anger')
        gender_label = ('female', 'male')

        if is_emotions:
            emotion = emotion_label[np.argmax(emotions[i], axis=1).flatten()[0]]
            confidence = np.max(emotions[i], axis=1).flatten()[0]
            result['attributes'].append({'name': 'emotion', 'value': emotion, 'confidence': confidence})

        if is_ages:
            age = str(int(ages[i].flatten()[0]*100))
            result['attributes'].append({'name': 'age', 'value': age, 'confidence': -1})

        if is_genders:
            gender = gender_label[np.argmax(genders[i], axis=1).flatten()[0]]
            confidence = np.max(genders[i], axis=1).flatten()[0]
            result['attributes'].append({'name': 'gender', 'value': gender, 'confidence': confidence})

        results.append(result)







