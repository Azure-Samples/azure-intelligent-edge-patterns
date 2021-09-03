import logging
from PIL import Image, ImageDraw
import io
import numpy as np
from tensorflow import make_tensor_proto, make_ndarray
import cv2
import inferencing_pb2
import media_pb2
import extension_pb2
import os
import ovms
import time

from cascade.voe_to_ovms import load_voe_config_from_json, voe_config_to_ovms_config

import threading

def process_voe_config(processor):
    while True:
        if os.path.exists('/workspace/voe_config.json'):
            metadatas_json = open('/workspace/voe_config.json').read()
            if metadatas_json != processor.metadatas_json:
                print('Updating Metadatas...')
                voe_config = load_voe_config_from_json(metadatas_json)
                _, metadatas = voe_config_to_ovms_config(voe_config)

                processor.metadatas = metadatas
                processor.metadatas_json = metadatas_json

        time.sleep(3)

def process_response(response, img, metadatas):
    predictions = []
    if response is not None:
        coordinates = make_ndarray(response.outputs['coordinates'])
        confidences = make_ndarray(response.outputs['confidences'])
        attributes = []

        for k in response.outputs:
            if (metadatas is not None) and (k in metadatas):
                #print(k)
                #print(metadatas[k])
                metadata = metadatas[k]
                if metadata['type'] == 'classification':
                    ndarray = make_ndarray(response.outputs[k])
                    tag_indexes = np.argmax(ndarray, axis=2).flatten()
                    tags = list(metadata['labels'][tag_index]
                                for tag_index in tag_indexes)
                    confidences = np.max(ndarray, axis=2).flatten()
                    attributes.append({
                        'name': k,
                        'type': 'classification',
                        'values': tags,
                        'confidences': confidences
                    })
                if metadata['type'] == 'regression':
                    ndarray = make_ndarray(response.outputs[k])
                    scores = ndarray
                    if 'scale' in metadata:
                        scores *= metadata['scale']
                    scores = scores.flatten().astype('int').tolist()
                    attributes.append({
                        'name': k,
                        'type': 'regression',
                        'values': scores
                    })

        n = coordinates.shape[0]
        predictions = []
        for i in range(n):
            x1, y1, x2, y2 = coordinates[i, 0]
            prediction = {
                'tag': 'face',
                'attributes': [],
                'confidence': confidences[i],
                'box': {
                    'l': x1,
                    't': y1,
                    'w': x2-x1,
                    'h': y2-y1
                }
            }
            print(attributes, flush=True)
            for attribute in attributes:
                if attribute['type'] == 'regression':
                    prediction['attributes'].append({
                        'name': attribute['name'],
                        'value': str(attribute['values'][i]),
                        'confidence': -1})
                if attribute['type'] == 'classification':
                    prediction['attributes'].append({
                        'name': attribute['name'],
                        'value': str(attribute['values'][i]),
                        'confidence': attribute['confidences'][i]})
            prediction['attributes'].sort(key=lambda x:x['name'])
            predictions.append(prediction)

    # followings is for drawing
    #h, w, _ = img.shape
    #for prediction in predictions:
    #    x1 = int(prediction['box']['l'] * w)
    #    y1 = int(prediction['box']['t'] * h)
    #    x2 = int((prediction['box']['w'] + prediction['box']['l']) * w)
    #    y2 = int((prediction['box']['h'] + prediction['box']['t']) * h)
    #    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 255), 3)
    #    font = cv2.FONT_HERSHEY_SIMPLEX
    #    fontScale = 0.5
    #    color = (0, 255, 255)
    #    thickness = 1
    #    text = prediction['tag']
    #    for attribute in prediction['attributes']:
    #        text += ' / ' + str(attribute['value'])
    #    cv2.putText(img, text, (x1, y1-10), font,
    #                fontScale, color, thickness, cv2.LINE_AA)
    return img, predictions

class OVMSBatchImageProcessor():
    def __init__(self):
        self.stub = None
        self.metadatas = None
        self.metadatas_json = ''
        self.th = threading.Thread(target=process_voe_config, args=(self,))
        self.th.start()
    
    def process_images(self, mediaStreamMessage, rawBytes, size):

        #FIXME
        if self.stub is None:
            self.stub = ovms.connect_ovms('ovmsserver:9001')

        # Read image raw bytes
        im = Image.frombytes('RGB', size, rawBytes.tobytes())
        #predictions = OVMS.predict

        img = np.asarray(im)
        img = img.astype(np.float32)  # BGR color format, shape HWC

        img = cv2.resize(img, (416, 416))
        img_tensor = img.reshape(1, 416, 416, 3)

        #predictions = [{'tag': 'aa', 'confidence': 0.5}]
        response = ovms.predict(self.stub, img_tensor)
        #print('1', flush=True)
        img, predictions = process_response(response, img, self.metadatas)
        #print('2', flush=True)


        for prediction in predictions:
            inference = mediaStreamMessage.media_sample.inferences.add()
            inference.type = inferencing_pb2.Inference.InferenceType.ENTITY

            attributes = []
            #print('3', flush=True)
            for attribute in prediction['attributes']:
                attributes.append(inferencing_pb2.Attribute(name=attribute['name'], value=attribute['value'], confidence=attribute['confidence']))

            #print('4', flush=True)
            inference.entity.CopyFrom(
                inferencing_pb2.Entity(
                    tag=inferencing_pb2.Tag(
                        value=prediction['tag'], 
                        confidence=prediction['confidence']
                    ),
                    box=inferencing_pb2.Rectangle(
                        l=prediction['box']['l'],
                        t=prediction['box']['t'],
                        w=prediction['box']['w'],
                        h=prediction['box']['h']
                    ),
                    attributes=attributes
                )
            )
        return mediaStreamMessage
