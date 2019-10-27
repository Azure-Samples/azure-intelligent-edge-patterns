# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import time
import sys
import json
import iothub_client
from iothub_client import IoTHubModuleClient, IoTHubClientError, IoTHubTransportProvider
from iothub_client import IoTHubMessage, IoTHubMessageDispositionResult, IoTHubError
import ImageProcessorGrpc_pb2
import ImageProcessorGrpc_pb2_grpc
from camera import Camera
from processorclient import ProcessorClient


camera = None
sleeptime = 1
processor_address = "VideoProcessorModule"
#processor_address = "localhost"
processor_client = ProcessorClient(processor_address,
                                   ImageProcessorGrpc_pb2.CameraToVideoProcessorPort)

def module_twin_callback(update_state, payload, user_context):
    print("\nTwin callback called with:\nupdate_state = {}".format(update_state))
    data = json.loads(payload)
    if "desired" in data:
        data = data["desired"]
        if "camera" in data:
            camera_data = data["camera"]
            global camera
            global sleeptime
            cam = Camera(camera_data)
            if cam is not None:
                if cam.seconds_between_images <= 0:
                    sleeptime = 1
                else:
                    sleeptime = cam.seconds_between_images
            else:            
                sleeptime = 1
            camera = cam


class HubManager(object):
    def __init__(self, protocol=IoTHubTransportProvider.MQTT):
        self.client_protocol = protocol
        self.client = IoTHubModuleClient()
        self.client.create_from_environment(protocol)

        # sets the callback when twin's properties are updated
        self.client.set_module_twin_callback(module_twin_callback, 0)

 
def main(protocol):
    try:
        print ( "\nPython %s\n" % sys.version )
        print ( "IoT Hub Client for Python" )

        hub_manager = HubManager(protocol)

        print ( "Starting the IoT Hub Python sample using protocol %s..." % hub_manager.client_protocol )
        print ( "The sample is now waiting for messages and will indefinitely.  Press Ctrl-C to exit. ")

        while True:
            if sleeptime is not None:
                time.sleep(sleeptime)
                if camera is not None:
                    image_body = camera.get_image()
                    processor_client.send_to_image_processor(image_body)

    except IoTHubError as iothub_error:
        print ( "Unexpected error %s from IoTHub" % iothub_error )
        return
    except KeyboardInterrupt:
        print ( "IoTHubModuleClient sample stopped" )

if __name__ == '__main__':
    # Choose HTTP, AMQP or MQTT as transport protocol.  Currently only MQTT is supported.
    PROTOCOL = IoTHubTransportProvider.MQTT
    main(PROTOCOL)