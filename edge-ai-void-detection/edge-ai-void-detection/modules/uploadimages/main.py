# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import os
import random
import time
import sys
from shutil import copyfile
import pprint
import threading
import redis
import socket

# from _ast import Bytes
import iothub_client
# pylint: disable=E0611
from iothub_client import IoTHubModuleClient, IoTHubClientError, IoTHubTransportProvider
from iothub_client import IoTHubMessage, IoTHubMessageDispositionResult, IoTHubError

import requests
import traceback
import base64
import json
import uuid
import importlib
from PIL import Image
import io
from io import BytesIO
import numpy as np
import datetime

# messageTimeout - the maximum time in milliseconds until a message times out.
# The timeout period starts at IoTHubModuleClient.send_event_async.
# By default, messages do not expire.
MESSAGE_TIMEOUT = 1000

# global counters
RECEIVE_CALLBACKS = 0
SEND_CALLBACKS = 0

# Choose HTTP, AMQP or MQTT as transport protocol.  Currently only MQTT is supported.
PROTOCOL = IoTHubTransportProvider.MQTT

MODULE_ID="testdefaultdeploy"
IMAGE_URL=""
#ML_ENDPOINT="http://10.121.114.46:5001/score"
print("ml_endpoint - global")
#ML_ENDPOINT = 'http://127.0.0.1:50000'
CATEGORY_INDEX={1: {'id': 1, 'name': 'void'}}
STORAGE_CONNECTION=""
STORAGE_ROOT=""
CONTAINER="images"
FILE_PATH = ""
CAPTUREDTIME = None
RESPONSE1 = None

IP_ADDRESS=""


redisConnection = redis.Redis(host='redisdb', port=6379, db=0)


import cv2
from matplotlib import pyplot as plt
colors_tableau = [(255, 255, 255), (31, 119, 180), (174, 199, 232), (255, 127, 14), (255, 187, 120),(44, 160, 44), (152, 223, 138), (214, 39, 40), (255, 152, 150),(148, 103, 189), (197, 176, 213), (140, 86, 75), (196, 156, 148),(227, 119, 194), (247, 182, 210), (127, 127, 127), (199, 199, 199),(188, 189, 34), (219, 219, 141), (23, 190, 207), (158, 218, 229)]
def draw_boxes_on_img(img, classes, scores, bboxes, thickness=2):
    shape = img.shape
    for i in range(bboxes.shape[0]):
        bbox = bboxes[i]
        # color = colors_tableau[classes[i]]
        color = (26, 26, 224)
        # Draw bounding box...
        p1 = (int(bbox[0] * shape[0]), int(bbox[1] * shape[1]))
        p2 = (int(bbox[2] * shape[0]), int(bbox[3] * shape[1]))
        cv2.rectangle(img, p1[::-1], p2[::-1], color, thickness)
        # Draw text...
        # s = '%s/%.3f' % (classes[i], scores[i])
        s = 'outofstock'
        p1 = (p1[0]-5, p1[1])
        cv2.putText(img, s, p1[::-1], cv2.FONT_HERSHEY_DUPLEX, 0.4, color, 1)


# Callback received when the message that we're forwarding is processed.
def send_confirmation_callback(message, result, user_context):
    global SEND_CALLBACKS
    print ( "Confirmation[%d] received for message with result = %s" % (user_context, result) )
    map_properties = message.properties()
    key_value_pair = map_properties.get_internals()
    print ( "    Properties: %s" % key_value_pair )
    SEND_CALLBACKS += 1
    print ( "    Total calls confirmed: %d" % SEND_CALLBACKS )


# receive_message_callback is invoked when an incoming message arrives on the specified 
# input queue (in the case of this sample, "input1").  Because this is a filter module, 
# we will forward this message onto the "output1" queue.
def receive_message_callback(message, hubManager):
    print("Received message from capture module on thread: " + str(threading.get_ident()))
    message_buffer = message.get_bytearray()
    map_properties = message.properties()
    message_text = message_buffer.decode('utf-8')
    message_json = ""
    try:
        message_json = json.loads(message_text)
    except Exception as ex: 
        print(type(ex))
        print(message_text)
    try:
        file_path =  message_json["filename"]
        print ( "    filePath: <<<%s" % (file_path))
    except:
        print("bad message.")
    scoring_response = json.dumps(message_json["response1"])
    process_single_image(file_path, scoring_response)
    return IoTHubMessageDispositionResult.ACCEPTED

def module_twin_callback(update_state, payload, user_context):
    print("inside module twin callbak")
    print ( "\nTwin callback called with:\nupdateStatus = %s\npayload = %s\ncontext = %s" % (update_state, payload, user_context) )
    print(payload)
    data = json.loads(payload)
    print("before parseing module twin")
    parse_module_twin(data)
    

# #AREA For DETECTION

def get_twin_property(twin, proper_name):
    if "desired" in twin and proper_name in twin["desired"]:
        result = twin["desired"][proper_name]
    if proper_name in twin:
        result = twin[proper_name]
    return(result)


def draw_image_mask_and_upload(file_name, img_data, out_dict, out_scores):
    start = time.time()
    src_upload = time.time() - start
    src_img_url=""
    start = time.time()
    draw_boxes_on_img(img_data, out_dict['classes'], out_dict['scores'], out_dict['bboxes'])
    vis_time = time.time() -start
    start = time.time()
    out_prefix = r"/imagefiles/out/"
    out_filename = file_name+".jpg"
    cv2.imwrite(out_prefix + out_filename,img_data)
    write_time = time.time()-start
    print("write time")
    print(write_time)
    dest_upload = time.time()-start
    dest_img_url ="http://"+IP_ADDRESS+":3001/images/output/" + out_filename
    post_start = time.time()
    post_endpoint(src_img_url, dest_img_url, out_scores, len(out_dict['bboxes']))
    post_end = time.time()-post_start
    print("post time")
    print(post_end)
    return(src_img_url, dest_img_url, src_upload, vis_time, dest_upload)

def post_endpoint(src_img_url, dest_img_url, out_scores, num_detections):
    data = {} 
    data['name'] = 'Out of Stock Action Detected'
    data['type'] = 'Event'
    data['Source'] = '39'
    data['captureTime'] = datetime.datetime.fromtimestamp(time.time()).isoformat()
    data['EdgeDeviceName'] = 'retail-onsite-dbe-edge'

    result = {}
    result['num_detections'] = num_detections
    result['size'] = {"width": 452, "height": 376}

    result['detection_boxes'] = []
    result['detection_scores'] = []
    result['detection_classes'] = []
    
    body =  {}
    body['moduleId'] = MODULE_ID
    body['messageId'] = 281
    body['src_img'] = src_img_url
    body['dest_img'] = dest_img_url
    body['result'] = result

    data['body'] = body
    post_data = json.dumps(data)
    print("post data")
    pprint.pprint(post_data)
    redisConnection.set('ImageEvent', post_data)

def format_image_url(root, container, name):
    if(root.endswith("/")):
        return("{0}{1}/{2}".format(root, container, name))
    else:
        return("{0}/{1}/{2}".format(root, container, name))


# def write_to_file(filename, content):
#     open(filename, 'wb').write(content) 


def convert_response(response):
    print("in convert response function")
    print(type(response))
    converted = json.loads(response)
    print(type(converted))
    #pprint.pprint("converted is" + converted)
    converted['bboxes'] = np.array(converted['bboxes'])
    converted['scores'] = np.array(converted['scores'])
    return(converted)


def convert_scores(response):
    print("in convert score function")
    print(type(response))
    converted = json.loads(response)
    print(type(converted))
    converted['bboxes'] = converted['bboxes']
    converted['scores'] = converted['scores']
    return(converted)


def process_single_image(file_path, scoring_data):
    start = time.time()
    print(">>Uploading Image: " + file_path + " at " + str(start))
    out_dict = convert_response(scoring_data)
    out_scores = convert_scores(scoring_data)
    img_data = cv2.imread(file_path, 1)
    file_name = file_path.replace("/imagefiles/","").replace(".jpg","")
    src_img_url, dest_img_url, src_upload, vis_time, dest_upload = draw_image_mask_and_upload(file_name, img_data, out_dict,out_scores)
    end = time.time()
    print("<<Finished uploading " + file_path + " at : " + str(time.time()) + " took " + str(end-start))
    return (src_img_url,dest_img_url, src_upload, vis_time, dest_upload)

def parse_module_twin(twin):
    print("inside parsing module twin")
    global IP_ADDRESS

    ip_address = get_twin_property(twin, "api_ip_address")
    if(not is_blank(ip_address)):
        IP_ADDRESS = ip_address
        print("External IP Parsed", IP_ADDRESS)
    else:
        print("Error when get External IP")

#     ml_url = get_twin_property(twin, "model_endpoint")
#     if(not is_blank(ml_url)):
#         ML_ENDPOINT = ml_url
#         print("Model Endpoint Parsed", ML_ENDPOINT)
#     else:
#         print("Error when get model endpoint")

#     storage_root = get_twin_property(twin, "storage_root")
#     if(not is_blank(storage_root)):
#         STORAGE_ROOT = storage_root
#         print("STORAGE_ROOT Parsed", STORAGE_ROOT)
#     else:
#         print("Error when get STORAGE_ROOT")

#     storage_connection = get_twin_property(twin, "storage_connection")
#     if(not is_blank(storage_connection)):
#         STORAGE_CONNECTION = storage_connection
#         global blob_service
#         blob_service = BlockBlobService(connection_string = STORAGE_CONNECTION)
#         print("STORAGE_CONNECTION Parsed", STORAGE_CONNECTION)
#     else:
#         print("Error when get STORAGE_CONNECTION")

#     img_url = get_twin_property(twin, "image_url")
#     if(not is_blank(img_url)):
#         IMAGE_URL = img_url
#         print("IMAGE_URL Parsed", IMAGE_URL)
#     else:
#         print("Error when get IMAGE_URL")


def is_blank (input):
    return not (input and input.strip())


class HubManager(object):

    def __init__(
            self,
            protocol=IoTHubTransportProvider.MQTT):
        self.client_protocol = protocol
        self.client = IoTHubModuleClient()
        self.client.create_from_environment(protocol)

        # set the time until a message times out
        self.client.set_option("messageTimeout", MESSAGE_TIMEOUT)
        print("before module twin callbak")
        self.client.set_module_twin_callback(module_twin_callback, self)
        
        # sets the callback when a message arrives on "input1" queue.  Messages sent to 
        # other inputs or to the default will be silently discarded.
        print("before receive message callback")
        self.client.set_message_callback("input1", receive_message_callback, self)

    # Forwards the message received onto the next stage in the process.


    def forward_event_to_output(self, outputQueueName, event, send_context):
        self.client.send_event_async(
            outputQueueName, event, send_confirmation_callback, send_context)

def main(protocol):
    try:
        print ( "\nPython %s\n" % sys.version )
        print ( "IoT Hub Client for Python" )
        hub_manager = HubManager(protocol)

        #print ( "Starting the IoT Hub Python sample using protocol %s..." % hub_manager.client_protocol )
        print ( "The sample is now waiting for messages and will indefinitely.  Press Ctrl-C to exit. ")

        while True:
            time.sleep(1)

    except IoTHubError as iothub_error:
        print ( "Unexpected error %s from IoTHub" % iothub_error )
        return
    except KeyboardInterrupt:
        print ( "IoTHubModuleClient sample stopped" )

if __name__ == '__main__':
    main(PROTOCOL)