# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

#from concurrent import futures
#import grpc
import numpy as np
import time

import traceback

import ImageProcessorGrpc_pb2
import ImageProcessorGrpc_pb2_grpc

class ImageServicer(ImageProcessorGrpc_pb2_grpc.GrpcChannelServicer):
    """
    gRPC server for receiving images to be submitted to a void-detection ML model.
    """
    def __init__(self, image_buffer):
        self.image_buffer = image_buffer

    def SubmitImage(self, request, context):
        """
        Implementation of the SubmitImage method described in the .proto file.
        """
        print("In SubmitImage")
        rv = ImageProcessorGrpc_pb2.ImageReply()
        rv.error = ''
        try:
            print("Adding ImageBody to buffer")
            self.image_buffer.add(request)
        except Exception as ex:
            rv.error = "Unexpected error in gRPC server: {}".format(ex)
            print(rv.error)
            traceback.print_exc()

        print("Returning from SubmitImage")
        return rv

