# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import os
import random
import time
import sys
import statistics
import threading
import ssdvgg_utils
from client import PredictionClient
import pprint
import grpc
import cv2
from matplotlib import pyplot as plt 
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
# from PIL import Image
import io
from io import BytesIO
import numpy as np
# import visualization_utils as vis_util
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

CATEGORY_INDEX={1: {'id': 1, 'name': 'void'}}

# Tensor outputs for retail model
tensor_outputs = [
    'ssd_300_vgg/block4_box/Reshape_1:0',
    'ssd_300_vgg/block7_box/Reshape_1:0',
    'ssd_300_vgg/block8_box/Reshape_1:0',
    'ssd_300_vgg/block9_box/Reshape_1:0',
    'ssd_300_vgg/block10_box/Reshape_1:0',
    'ssd_300_vgg/block11_box/Reshape_1:0',
    'ssd_300_vgg/block4_box/Reshape:0',
    'ssd_300_vgg/block7_box/Reshape:0',
    'ssd_300_vgg/block8_box/Reshape:0',
    'ssd_300_vgg/block9_box/Reshape:0',
    'ssd_300_vgg/block10_box/Reshape:0',
    'ssd_300_vgg/block11_box/Reshape:0'
]

client = PredictionClient(os.getenv('ML_MODULE_NAME','fpga-stock-module'), 50051)

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
    # global RECEIVE_CALLBACKS
    print("Received message from capture module on thread: " + str(threading.get_ident()))
    message_buffer = message.get_bytearray()
    size = len(message_buffer)
    print ( "    Data: <<<%s>>>" % (message_buffer.decode('utf-8')))
    map_properties = message.properties()
    message_text = message_buffer.decode('utf-8')
    file_path = message_text
    print ( "    filePath: <<<%s>>> & Size=%d" % (message_text, size) )
    score_single_image(hubManager, file_path)
    key_value_pair = map_properties.get_internals()
    print ( "    Properties: %s" % key_value_pair )
    return IoTHubMessageDispositionResult.ACCEPTED

def module_twin_callback(update_state, payload, user_context):
    print("inside module twin callbak")
    print ( "\nTwin callback called with:\nupdateStatus = %s\npayload = %s\ncontext = %s" % (update_state, payload, user_context) )
    print(payload)
    print("before parseing module twin")

#AREA For DETECTION

def get_twin_property(twin, proper_name):
    if "desired" in twin and proper_name in twin["desired"]:
        result = twin["desired"][proper_name]
    if proper_name in twin:
        result = twin[proper_name]
    return(result)

def score_single_image(hub_manager, file_path):
    start = time.time()
    print(">>Processing Image: " + file_path + " at " + str(start))
    if file_path:
        t1 = time.time()
        try:
            img = cv2.imread(file_path, 1)
            img = cv2.resize(img, (300, 300), cv2.INTER_AREA)
            img = img[:, :, ::-1] 
            img = img - (123, 117, 104)
            img = np.asarray(img, dtype=np.float32)
            img = np.expand_dims(img, axis=0)
            resize_time = time.time()
            result = client.score_numpy_arrays({'brainwave_ssd_vgg_1_Version_0.1_input_1:0':img}, outputs=tensor_outputs)
            classes, scores, bboxes = ssdvgg_utils.postprocess(result, select_threshold=0.4)
            processed_results = {}
            processed_results["classes"] = classes.tolist()
            processed_results["scores"] = scores.tolist()
            processed_results["bboxes"] = bboxes.tolist()
            messages = {}
            messages['filename'] = file_path
            messages['response1'] = processed_results
            messages = json.dumps(messages)
            message=IoTHubMessage(messages)
            t2 = time.time()
            hub_manager.client.send_event_async("output1", message, send_confirmation_callback, 0)
            print("<<Finished processing at : " + str(time.time()) + " took " + str(t2-start))
        except:
            print("Unexpected Error:", traceback.print_exc())

def format_image_url(root, container, name):
    if(root.endswith("/")):
        return("{0}{1}/{2}".format(root, container, name))
    else:
        return("{0}/{1}/{2}".format(root, container, name))


def write_to_file(filename, content):
    open(filename, 'wb').write(content) 


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
        self.client.set_module_twin_callback(module_twin_callback, self)
        
        # sets the callback when a message arrives on "input1" queue.  Messages sent to 
        # other inputs or to the default will be silently discarded.
        print("before receive message callback")
        self.client.set_message_callback("input1", receive_message_callback, self)

    # Forwards the message received onto the next stage in the process.
    def forward_event_to_output(self, outputQueueName, event, send_context):
        print("inside forward event function")
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