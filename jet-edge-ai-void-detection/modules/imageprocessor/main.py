# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

from concurrent import futures
import random
import time
from datetime import datetime
import sys
import json
import grpc

import iothub_client
from iothub_client import IoTHubModuleClient, IoTHubClientError, IoTHubTransportProvider
from iothub_client import IoTHubMessage, IoTHubMessageDispositionResult, IoTHubError
from azure.storage.blob import BlockBlobService

import fpgagrpc_pb2
import fpgagrpc_pb2_grpc
import ImageProcessorGrpc_pb2
import ImageProcessorGrpc_pb2_grpc

from grpcserver import ImageServicer
from imagebuffer import ImageBuffer
from fpgaimageprocessor import FPGAImageProcessor
from cpuimageprocessor import CPUImageProcessor

image_buffer = ImageBuffer()
image_processor = None
blob_uploader = None
hub_manager = None


class BlobUploader:
    """
    A simple helper class for uploading image data to blob storage.
    """

    def __init__(self, container_name, connection_string):
        self.container_name = container_name
        self.block_blob_service = BlockBlobService(connection_string=connection_string)

    def upload(self, camera_id, base_name, extension, data):
        blob_name = camera_id + '/' + base_name + '.' + extension
        self.block_blob_service.create_blob_from_bytes(self.container_name,
                                                       blob_name,
                                                       data)


def module_twin_callback(update_state, payload, user_context):
    print("\nTwin callback called with:\nupdate_state = {}".format(update_state))
    data = json.loads(payload)
    if "desired" in data:
        data = data["desired"]
        if "blobStorageSasUrl" in data:
            sasKey = str(data["blobStorageSasUrl"])
            print("Creating new BlobUploader")
            global blob_uploader
            blob_uploader = BlobUploader("still-images", sasKey)
        if "mlModelType" in data:
            modelType = str(data["mlModelType"])
            global image_processor
            if modelType == "FPGA":
                image_processor = FPGAImageProcessor()
            elif modelType == "CPU":
                image_processor = CPUImageProcessor()
            elif modelType == "GPU":
                print("GPU model not yet supported")
                image_processor = None
            else:
                print("unrecognized mlModelType:", modelType)
                image_processor = None


class HubManager(object):
    def __init__(self, protocol=IoTHubTransportProvider.MQTT):
        self.client_protocol = protocol
        self.client = IoTHubModuleClient()
        self.client.create_from_environment(protocol)

        # sets the callback when twin's properties are updated
        self.client.set_module_twin_callback(module_twin_callback, 0)

    def send_hub_message(self, message):
        """Send a message to the IoT Hub

            message:    An IoTHubMessage object
        """
        self.client.send_event_async(message, (lambda x, y, z: None), None)


def send_iot_hub_message(message, schema):
    """Send a message to the IoT Hub, with custom properties for message
    timestamp and schema.

    message:    The message to be sent, in JSON format.

    schema:     A string containing the message schema.
    """
    msg = IoTHubMessage(message)
    prop_map = msg.properties()
    prop_map.add("MessageSchema", schema)
    prop_map.add("CreationTimeUtc", '') #TODO: set date/time
    hub_manager.send_hub_message(msg)


def send_recognition_messages(rec, image_body):
    """Send individual recognition messages to the IoT Hub, one for each recognition.

        rec:    The processed results from the image processing. This is a dictionary
        containing arrays of classes, scores, and bounding boxes.

        image_body: The image data sent from the camera module.
    """
    class Info:
        pass

    classes = rec["classes"]
    scores = rec["scores"]
    bboxes = rec["bboxes"]
    for i in range(len(classes)):
        try:
            info = Info()
            info.cameraId = image_body.cameraId
            info.time = image_body.time
            info.cls = classes[i]
            info.score = scores[i]
            info.bbymin = bboxes[i][0]
            info.bbxmin = bboxes[i][1]
            info.bbymax = bboxes[i][2]
            info.bbxmax = bboxes[i][3]
            msg = json.dumps(info.__dict__)
            send_iot_hub_message(msg, "recognition;v1")
        except Exception as ex:
            print("Exception caught in send_recognition_messages: {}".format(ex))


def send_image_message(feature_count, image_body, msec, processor_type):
    """Helper function for sending messages to the IoT Hub."""
    class Info:
        pass
    
    try:
        info = Info()
        info.cameraId = image_body.cameraId
        info.time = image_body.time
        info.type = image_body.type
        info.featureCount = feature_count
        info.procType = processor_type
        info.procMsec = msec
        msg = json.dumps(info.__dict__)
        send_iot_hub_message(msg, "image-upload;v1")
    except Exception as ex:
        print("Exception caught in send_image_message: {}".format(ex))


def process_next_image():
    """Fetch the next image, if any, from the queue and process it."""
    if blob_uploader:
        image_body = image_buffer.get_next()
        if image_body:
            if image_processor:
                process_start_time = datetime.now()
                result = image_processor.process_image(image_body)
                diff = datetime.now() - process_start_time
                msec = (diff.days * 86400000) + (diff.seconds * 1000) + (diff.microseconds / 1000)
                print("processed results:")
                print(result)
                if result:
                    blob_uploader.upload(image_body.cameraId,
                                         image_body.time,
                                         image_body.type,
                                         bytes(image_body.image))
                    send_recognition_messages(result, image_body)
                    send_image_message(len(result["classes"]),
                                           image_body,
                                           msec,
                                           image_processor.processor_type)


def main(protocol, port):
    try:
        print("\nPython %s\n" % sys.version)
        print("imageprocessor module")

        global hub_manager
        hub_manager = HubManager(protocol)

        print("Starting the imageprocessor module using protocol %s..." % hub_manager.client_protocol)

        #Start the server and prepare it for servicing incoming connections.
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        ImageProcessorGrpc_pb2_grpc.add_GrpcChannelServicer_to_server(ImageServicer(image_buffer),
                                                                      server)

        print("using port {}".format(port))
        server.add_insecure_port('[::]:{}'.format(port))

        server.start()
        print("GRPC server started.")

        while True:
            process_next_image()
            time.sleep(1)

    except IoTHubError as iothub_error:
        print("Unexpected error %s from IoTHub" % iothub_error)
        return
    except KeyboardInterrupt:
        print ( "IoTHubModuleClient sample stopped" )


if __name__ == '__main__':
    # Choose HTTP, AMQP or MQTT as transport protocol.  Currently only MQTT is supported.
    PROTOCOL = IoTHubTransportProvider.MQTT
    port = ImageProcessorGrpc_pb2.CameraToVideoProcessorPort
    main(PROTOCOL, port)
