# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import time
import json
from iothub_client import IoTHubClient, IoTHubMessage, IoTHubModuleClient, IoTHubMessageDispositionResult,IoTHubClientError, IoTHubTransportProvider, IoTHubClientResult, IoTHubError

import logging
import cv2

from utility import get_file_zip,get_file
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

TO_UPSTREAM_MESSAGE_QUEUE_NAME = "ToUpstream"

# messageTimeout - the maximum time in milliseconds until a message times out.
# The timeout period starts at IoTHubModuleClient.send_event_async.
# By default, messages do not expire.
MESSAGE_TIMEOUT = 10000

# global counters
send_callbacks = 0

inference_files_zip_url =""
msg_per_minute = 12
object_of_interest = "ALL"
video_path = "./video/video.mp4"

class IotHubManager(object):
    TIMER_COUNT = 2

    def __init__(self, protocol):
        print("Creating IoT Hub manager")
        self.client_protocol = protocol
        self.client = IoTHubModuleClient()
        self.client.create_from_environment(protocol)

        # set the time until a message times out
        self.client.set_option("messageTimeout", MESSAGE_TIMEOUT)
        self.client.set_module_twin_callback(self.module_twin_callback, self)
        self.setRestartCamera = False

    # sends a messager to the "ToUpstream" queue to be sent to hub
    def send_message_to_upstream(self, message,last_sent_time=time.time()):
        try:
            if(time.time() - last_sent_time <= (60/msg_per_minute)):
                return last_sent_time
            message = IoTHubMessage(message)
            self.client.send_event_async(
                TO_UPSTREAM_MESSAGE_QUEUE_NAME,
                message,
                self.__send_confirmation_callback,
                0)
            last_sent_time = time.time()
            return last_sent_time
            # logging.info("finished sending message...")
        except Exception as ex:
            print("Exception in send_message_to_upstream: %s" % ex)
            return last_sent_time
            #pass

    # Callback received when the message that we're forwarding is processed.
    def __send_confirmation_callback(self, message, result, user_context):
        global send_callbacks
        print("Confirmation[%d] received for message with result = %s" % (
            user_context, result))
        map_properties = message.properties()
        key_value_pair = map_properties.get_internals()
        print("\tProperties: %s" % key_value_pair)
        send_callbacks += 1
        print("\tTotal calls confirmed: %d" % send_callbacks)

    def send_reported_state_callback(self, status_code, user_context):
        print ( "" )
        print ( "Confirmation for reported state called with:" )
        print ( "    status_code: %d" % status_code )

    def send_property(self, prop):
        try:            
            if self.client.protocol == IoTHubTransportProvider.MQTT:
                self.client.send_reported_state(prop,
                                                len(prop), 
                                                self.send_reported_state_callback, 
                                                prop)                                                
        except Exception as ex:
            print("Exception in send_property: %s" % ex)

    def module_twin_callback(self,update_state, payload, user_context):
        try:
            global inference_files_zip_url
            global msg_per_minute
            global object_of_interest
            global video_path
            print ( "" )
            print ( "Twin callback called with:" )
            print ( "    updateStatus: %s" % update_state )
            print ( "    payload: %s" % payload )
            data = json.loads(payload)
            self.setRestartCamera = False
            self.restartCamera = False
            if "desired" in data and "inference_files_zip_url" in data["desired"]:
                dst_folder="./model"
                inference_files_zip_url = data["desired"]["inference_files_zip_url"]
                if inference_files_zip_url:
                    print("Setting value to %s from ::  data[\"desired\"][\"all_inference_files_zip\"]" % inference_files_zip_url)
                    self.setRestartCamera = get_file_zip(inference_files_zip_url,dst_folder)
                else:
                    print(inference_files_zip_url)
            if "inference_files_zip_url" in data:
                dst_folder="model"
                inference_files_zip_url = data["inference_files_zip_url"]
                if inference_files_zip_url:
                    print("Setting value to %s from ::  data[\"all_inference_files_zip\"]" % inference_files_zip_url)
                    self.setRestartCamera = get_file_zip(inference_files_zip_url,dst_folder)
                    #self.setRestartCamera = True
                else:
                    print(inference_files_zip_url)


            
            if "desired" in data and "video_path" in data["desired"]:
                dst_folder="video"
                video_path = data["desired"]["video_path"]
                if video_path:
                    print("Setting value to %s from ::  data[\"desired\"][\"video_path\"]" % video_path)
                    self.setRestartCamera = get_file_zip(video_path,dst_folder)
                else:
                    print(video_path)
            if "video_path" in data:
                dst_folder="video"
                video_path = data["video_path"]
                if video_path:
                    print("Setting value to %s from ::  data[\"video_path\"]" % video_path)
                    self.setRestartCamera = get_file_zip(video_path,dst_folder)
                    self.setRestartCamera = True
                else:
                    print(video_path)



            
            if "desired" in data and "object_of_interest" in data["desired"]:
                object_of_interest = data["desired"]["object_of_interest"]
                print("Setting value to %s from ::  data[\"object_of_interest\"]" % object_of_interest)

            if "object_of_interest" in data:
                object_of_interest = data["object_of_interest"]
                print("Setting value to %s from ::  data[\"object_of_interest\"]" % object_of_interest)

            if "desired" in data and "msg_per_minute" in data["desired"]:
                msg_per_minute = data["desired"]["msg_per_minute"]
                print("Setting value to %s from ::  data[\"msg_per_minute\"]" % msg_per_minute)

            if "msg_per_minute" in data:
                msg_per_minute = data["msg_per_minute"]
                print("Setting value to %s from ::  data[\"msg_per_minute\"]" % msg_per_minute)
        except Exception as ex:
            print("Exception in module_twin_callback: %s" % ex)

        if self.setRestartCamera:
            # Restarting inference when get twinupdate
            try:
                logger.info("Restarting inferencing")
                self.restartCamera = True

            except Exception as e:
                logger.info("Got an issue during cam ON off after twin update")
                logger.exception(e)
                raise
