# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import os
import random
import time
import sys
from shutil import copyfile
import tempfile
import time
import VideoStream
from VideoStream import VideoStream
import cv2

import iothub_client
# pylint: disable=E0611
from iothub_client import IoTHubModuleClient, IoTHubClientError, IoTHubTransportProvider
from iothub_client import IoTHubMessage, IoTHubMessageDispositionResult, IoTHubError

import traceback
import base64
import json
import importlib
from PIL import Image
from io import BytesIO
import os.path
import pprint

# messageTimeout - the maximum time in milliseconds until a message times out.
# The timeout period starts at IoTHubModuleClient.send_event_async.
# By default, messages do not expire.
MESSAGE_TIMEOUT = 20000

# global counters
RECEIVE_CALLBACKS = 0
SEND_CALLBACKS = 0
FILE_PATH = ""

# Choose HTTP, AMQP or MQTT as transport protocol.  Currently only MQTT is supported.
PROTOCOL = IoTHubTransportProvider.MQTT

# Add Default Twins settings
MODULE_ID="captureimagesrtsp"
IMAGE_URL="rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov"
FRAMES_PER_SECOND = 20
CROP_COORDINATES = "0,0,320,240"

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
    global RECEIVE_CALLBACKS    
    message = json.dumps(FILE_PATH)
    print("message to send is:")
    pprint.pprint(message)
    message = IoTHubMessage(message)
    hubManager.forward_event_to_output("output1", message, 0)
    return IoTHubMessageDispositionResult.ACCEPTED

def module_twin_callback(update_state, payload, user_context):
    print ( "\nTwin callback called with:\nupdateStatus = %s\npayload = %s\ncontext = %s" % (update_state, payload, user_context) )
    print(payload)
    data = json.loads(payload)
    parse_module_twin(data)
    
    
def get_image_data(image_url):
    img_data = requests.get(image_url).content
    return(img_data)

def get_twin_property(twin, proper_name):
    result = ""
    if "desired" in twin and proper_name in twin["desired"]:
        result = twin["desired"][proper_name]
    if proper_name in twin:
        result = twin[proper_name]
    return(result)

def get_image_url():
    retry_times =0
    while(retry_times <=3):
        print("before if block image url function" + IMAGE_URL)
        if(IMAGE_URL == None or IMAGE_URL ==""):
            print("in if block image url function" + IMAGE_URL)
            print("CAN NOT GET IMAGE URL FROM CONFIG, USE DEFAULT URL")
            time.sleep(5)
            print("retry for fetch image_url")
            retry_times=retry_times+1
        else:
            return IMAGE_URL
        
        print("ERROR GET IMAGE URL, WAIT FOR TWIN TO BE PARSED")


def capture_single_image(capture,start,hub_manager):
    print(">> Capturing image: " + str(start))
    frame = capture.read()
    #Flip color space if necessary
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(rgb_frame)
    # Dimensions to crop image
    if not is_blank(CROP_COORDINATES):
        split_crop = CROP_COORDINATES.split(",")
        pil_image = pil_image.crop((int(split_crop[0]),int(split_crop[1]), int(split_crop[2]), int(split_crop[3])))
    file_path = os.path.join("/imagefiles",str(start)+".jpg")
    pil_image.save(file_path)
    save_end = time.time()
    print("Time - Capture to Save: " + str((save_end-start)))
    print ("sending message...")
    message=IoTHubMessage(file_path)
    hub_manager.client.send_event_async("output1", message, send_confirmation_callback, 0)
    print ("finished sending message...")
    print("<< Completed. Start time: " + str(start))

def loop_image_capture(hub_manager):
    while(True):
        try:
            img_url = get_image_url()
            if(not is_blank(img_url)):
                capture = VideoStream(img_url).start()
                time.sleep(1.0)
                start = time.time()
                while True:
                    if start + (1.0/FRAMES_PER_SECOND) < time.time():
                        start = time.time()
                        capture_single_image(capture,start,hub_manager)
            else:
                print("=============Could not fetch image url=====================")
                time.sleep(5)
        except:
            print("Un expected Error:", traceback.print_exc())
    #time.sleep(1)
    
def parse_module_twin(twin):
    global IMAGE_URL, MODULE_ID, FRAMES_PER_SECOND, CROP_COORDINATES

    module_id = get_twin_property(twin, "module_id")
    if(not is_blank(module_id)):
        MODULE_ID = module_id
        print("Module ID Parsed", MODULE_ID)
    else:
        print("Error when get Module ID")

    img_url = get_twin_property(twin, "image_url")
    if(not is_blank(img_url)):
        IMAGE_URL = img_url
        print("IMAGE_URL Parsed", IMAGE_URL)
    else:
        print("Error when get IMAGE_URL")

    fps = get_twin_property(twin, "frames_per_second")
    print("Getting FPS")
    if(not is_blank(fps)):
        FRAMES_PER_SECOND = int(fps)
        print("FPS Parsed", FRAMES_PER_SECOND)
    else:
        print("Error getting FPS")
    
    crop = get_twin_property(twin, "crop")
    print("Getting crop")
    if(not is_blank(crop)):
        CROP_COORDINATES = crop
        print("Crop Coordinates Parsed", CROP_COORDINATES)
    else:
        print("Error getting crop")
    


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

        print ( "The module is now waiting for messages and will indefinitely.  Press Ctrl-C to exit. ")

        loop_image_capture(hub_manager)

        while True:
            time.sleep(1)

    except IoTHubError as iothub_error:
        print ( "Unexpected error %s from IoTHub" % iothub_error )
        return
    except KeyboardInterrupt:
        print ( "IoTHubModuleClient sample stopped" )

if __name__ == '__main__':
    main(PROTOCOL)
