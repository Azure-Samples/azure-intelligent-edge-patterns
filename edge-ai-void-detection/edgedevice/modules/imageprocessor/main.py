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
import cv2
import numpy as np

import iothub_client
from iothub_client import IoTHubModuleClient, IoTHubClientError, IoTHubTransportProvider
from iothub_client import IoTHubMessage, IoTHubMessageDispositionResult, IoTHubError
from azure.storage.blob import BlockBlobService

import fpgagrpc_pb2
import fpgagrpc_pb2_grpc
import ImageProcessorGrpc_pb2
import ImageProcessorGrpc_pb2_grpc
import BoundingBoxProcessorGrpc_pb2
import BoundingBoxProcessorGrpc_pb2_grpc
from boundingboxclient import BoundingBoxClient
from grpcserver import ImageServicer
from imagebuffer import ImageBuffer
from fpgaimageprocessor import FPGAImageProcessor
from cpuimageprocessor import CPUImageProcessor


image_buffer = ImageBuffer()
image_processor = None
blob_uploader = None
hub_manager = None

processor_address = "boundingboxprocessor"
processor_client = BoundingBoxClient(processor_address,
                                     BoundingBoxProcessorGrpc_pb2.ImageProcessorToBoundingBoxPort)


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
        print("uploaded", blob_name)


def module_twin_callback(update_state, payload, user_context):
    print("\nTwin callback called:\nupdate_state = {0}\npayload = {1}".format(update_state, payload))
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


def rgb_to_np_array(img_rgb):
    print("In rgb_to_np_array")
    print("img_rgb type:", type(img_rgb))
    shape = (300, 300, 3)
    print("Calling np.frombuffer")
    img = np.frombuffer(img_rgb, dtype = np.dtype('uint8'))
    print("Calling np.reshape")
    img = np.reshape(img, shape)
    print("Calling cv2.cvtColor")
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    print("Returning img")
    return img

def process_next_image():
    """Fetch the next image, if any, from the queue and process it."""
    if blob_uploader:
        print("Have blob_loader")
        image_body = image_buffer.get_next()
        if image_body:
            print("Have image_body")
            if image_processor:
                print("Have image_processor")
                process_start_time = datetime.now()
                result = image_processor.process_image(image_body)
                diff = datetime.now() - process_start_time
                msec = (diff.days * 86400000) + (diff.seconds * 1000) + (diff.microseconds / 1000)
                print("processed results:")
                print(result)
                if result:
                    # Call gRPC server to handle bounding boxes
                    image_data = BoundingBoxProcessorGrpc_pb2.ImageData()
                    image_data.cameraId = image_body.cameraId
                    image_data.time = image_body.time
                    image_data.type = image_body.type
                    print("type of smallImageRGB:", type(image_body.smallImageRGB))
                    image_data.image = bytes(rgb_to_np_array(image_body.smallImageRGB))
                    image_data.scoringData = json.dumps(result)
                    print("Calling bounding box gRPC server")
                    bbox_jpeg = processor_client.send_to_bbox_processor(image_data)
                    print("type of bbox_jpeg:", type(bbox_jpeg))
                    if bbox_jpeg is not None:
                        blob_uploader.upload(image_body.cameraId,
                                            image_body.time,
                                            image_body.type,
                                            bytes(image_body.image))
                        blob_uploader.upload(image_body.cameraId,
                                            image_body.time + "_bbox",
                                            "jpg",
                                            bytes(bbox_jpeg))
                        send_recognition_messages(result, image_body)
                        send_image_message(len(result["classes"]),
                                            image_body,
                                            msec,
                                            image_processor.processor_type)


def main(protocol, port):
    try:
        print("Image processor module")
        print("\nPython %s\n" % sys.version)

        global hub_manager
        hub_manager = HubManager(protocol)

        print("Talking to IoT Hub using protocol %s..." % hub_manager.client_protocol)

        #Start the gRPC server and prepare it for servicing incoming connections.
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        ImageProcessorGrpc_pb2_grpc.add_GrpcChannelServicer_to_server(ImageServicer(image_buffer),
                                                                      server)

        print("Starting gRPC server using port {}".format(port))
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
        print("Image processor module stopped")


if __name__ == '__main__':
    # Choose HTTP, AMQP or MQTT as transport protocol.  Currently only MQTT is supported.
    PROTOCOL = IoTHubTransportProvider.MQTT
    port = ImageProcessorGrpc_pb2.CameraToVideoProcessorPort
    main(PROTOCOL, port)
