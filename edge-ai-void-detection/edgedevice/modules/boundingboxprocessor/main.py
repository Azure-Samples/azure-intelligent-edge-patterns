# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

from concurrent import futures
import time
import os
import sys
import json
import grpc
import cv2
import numpy as np
import redis
import traceback
import iothub_client
from iothub_client import IoTHubModuleClient, IoTHubClientError, IoTHubTransportProvider
from iothub_client import IoTHubMessage, IoTHubMessageDispositionResult, IoTHubError

import BoundingBoxProcessorGrpc_pb2
import BoundingBoxProcessorGrpc_pb2_grpc

MODULE_ID="testdefaultdeploy"
IP_ADDRESS = ""
redisConnection = redis.Redis(host='redisdb', port=6379, db=0)


def post_endpoint(src_img_url, dest_img_url, image_data):
    print("In post_endpoint")
    data = {}
    data['name'] = 'Out of Stock Action Detected'
    data['type'] = 'Event'
    data['Source'] = '39'
    data['captureTime'] = image_data.time
    data['EdgeDeviceName'] = 'retail-onsite-dbe-edge'

    result = {}
    scoringData = json.loads(image_data.scoringData)
    result['num_detections'] = len(scoringData["bboxes"])
    result['size'] = {"width": 300, "height": 300}
    result['detection_boxes'] = []
    result['detection_scores'] = []
    result['detection_classes'] = []

    body = {}
    body['moduleId'] = MODULE_ID
    body['messageId'] = 281
    body['src_img'] = src_img_url
    body['dest_img'] = dest_img_url
    body['result'] = result

    data['body'] = body
    post_data = json.dumps(data)
    print("post data")
    print(post_data)
    print("posting to redis")
    x = redisConnection.set('ImageEvent', post_data)
    print("redisConnection.set returned", x)

def draw_bounding_boxes(img, bboxes, thickness=2):
    shape = img.shape
    color = (26, 26, 224)
    for i in range(len(bboxes)):
        bbox = bboxes[i]
        # Draw bounding box
        p1 = (int(bbox[0] * shape[0]), int(bbox[1] * shape[1]))
        p2 = (int(bbox[2] * shape[0]), int(bbox[3] * shape[1]))
        cv2.rectangle(img, p1[::-1], p2[::-1], color, thickness)
        # Draw text
        s = "outofstock"
        p1 = (p1[0] - 5, p1[1])
        cv2.putText(img, s, p1[::-1], cv2.FONT_HERSHEY_DUPLEX, 0.4, color, 1)

def process_image(image_data):
    """Process a single image."""
    print("In process_image")
    src_img_url = ""
    #img = image_data.image
    img = np.frombuffer(image_data.image, dtype = np.dtype('uint8'))
    img = np.reshape(img, (300, 300, 3))
    print("Converting scoring data from JSON")
    scoringData = json.loads(image_data.scoringData)
    print("scoringData")
    print(scoringData)
    print("Drawing bounding boxes")
    draw_bounding_boxes(img, scoringData["bboxes"])
    out_prefix = r"/imagefiles/out/"
    out_filename = image_data.time + ".jpg"
    print("Writing image to local storage")
    try:
        x = cv2.imwrite(out_prefix + out_filename, img)
        print("imwrite returned", x)
    except Exception as ex:
        print("Failure during write:", ex)
    print("Checking IP_ADDRESS")
    if is_blank(IP_ADDRESS):
        print("IP_ADDRESS is not set, not posting to redis.")
    else:
        dest_img_url ="http://"+IP_ADDRESS+":3001/images/output/" + out_filename
        post_endpoint(src_img_url, dest_img_url, image_data)
    # Convert the cv2 image to a jpeg for return to the image processor.
    print("Converting image to jpeg")
    jpeg = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 75])[1]
    print("Conversion done")
    print("jpeg shape:", jpeg.shape)
    print("Returning jpeg")
    return jpeg


class ImageServicer(BoundingBoxProcessorGrpc_pb2_grpc.GrpcChannelServicer):
    """gRPC server for receiving image data from image processor."""
    def __init__(self):
        print("In ImageServicer.__init__")

    def SubmitImage(self, request, context):
        print("In SubmitImage")
        rv = BoundingBoxProcessorGrpc_pb2.ImageReply()
        rv.error = ''
        try:
            print("Calling process_image")
            rv.boxedImage = bytes(process_image(request))
        except Exception as ex:
            rv.error = "Unexpected error in gRPC server: {}".format(ex)
            print(rv.error)
            traceback.print_exc()
        return rv


def is_blank(input):
    return not (input and input.strip())

def module_twin_callback(update_state, payload, user_context):
    global IP_ADDRESS
    print("\nTwin callback called:\nupdate_state = {0}\npayload = {1}".format(update_state, payload))
    data = json.loads(payload)
    if "desired" in data:
        data = data["desired"]
        if "api_ip_address" in data:
            ip_address = data["api_ip_address"]
            if not is_blank(ip_address):
                IP_ADDRESS = ip_address
                print("IP address parsed from module twin:", IP_ADDRESS)
            else:
                print("Error getting IP address")


class HubManager(object):
    def __init__(self, protocol=IoTHubTransportProvider.MQTT):
        self.client_protocol = protocol
        self.client = IoTHubModuleClient()
        self.client.create_from_environment(protocol)

        # sets the callback when twin's properties are updated
        self.client.set_module_twin_callback(module_twin_callback, 0)

def main(protocol, port):
    try:
        print("Bounding box processor module")
        print("\nPython %s\n" % sys.version)

        hub_manager = HubManager(protocol)

        print("Talking to IoT Hub using protocol %s..." % hub_manager.client_protocol)

        #Start the gRPC server and prepare it for servicing incoming connections.
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        BoundingBoxProcessorGrpc_pb2_grpc.add_GrpcChannelServicer_to_server(ImageServicer(), server)

        print("Starting gRPC server using port {}".format(port))
        server.add_insecure_port('[::]:{}'.format(port))

        server.start()
        print("GRPC server started.")

        while True:
            time.sleep(1)

    except Exception as ex:
        print("Unexpected error %s " % ex)
        raise

if __name__ == "__main__":
    # Choose HTTP, AMQP or MQTT as transport protocol.  Currently only MQTT is supported.
    PROTOCOL = IoTHubTransportProvider.MQTT
    port = BoundingBoxProcessorGrpc_pb2.ImageProcessorToBoundingBoxPort
    main(PROTOCOL, port)
