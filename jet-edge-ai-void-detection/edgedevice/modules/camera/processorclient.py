# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import grpc
import time
from datetime import datetime, timedelta

import ImageProcessorGrpc_pb2
import ImageProcessorGrpc_pb2_grpc

class ProcessorClient:
    """Provides a gRPC client for submitting an image to the imaqge processor module."""
    def __init__(self, serverhost, port=None, use_ssl=False, access_token=None,
                 service_name=None, channel_shutdown_timeout=timedelta(minutes=2)):
        if serverhost is None:
            raise ValueError("serverhost")

        if port is None:
            if use_ssl:
                port = 443
            else:
                port = 80

        if access_token is None:
            access_token = ""
        if service_name is None:
            service_name = ""

        host = "{0}:{1}".format(serverhost, port)
        print("ProcessorClient: host = '{}'".format(host))

        self.metadata = [("authorization", "Bearer {}".format(access_token)),
                         ("x-ms-aml-grpc-service-route", service_name)]
        grpc.composite_channel_credentials(grpc.ssl_channel_credentials())

        if use_ssl:
            self._channel_func = lambda: grpc.secure_channel(host, grpc.ssl_channel_credentials())
        else:
            self._channel_func = lambda: grpc.insecure_channel(host)
        
        self.__channel_shutdown_timeout = channel_shutdown_timeout
        self.__channel_usable_until = None
        self.__channel = None

    def _get_grpc_stub(self):
        if self.__channel_usable_until is None or self.__channel_usable_until < datetime.now():
            self.__reinitialize_channel()
        self.__channel_usable_until = datetime.now() + self.__channel_shutdown_timeout
        return self.__stub

    def __reinitialize_channel(self):
        self.__stub = None
        if self.__channel is not None:
            self.__channel.close()
        self.__channel = self._channel_func()
        self.__stub = ImageProcessorGrpc_pb2_grpc.GrpcChannelStub(self.__channel)

    def send_to_image_processor(self, image_body):
        try:
            result = self._get_grpc_stub().SubmitImage(image_body)
            if result.error:
                print("Error {}".format(result.error))
        except grpc.RpcError as ex:
            print("SubmitImage failed. Error code {0}, {1}".format(ex.code(), ex.details()))
        except Exception as ex:
            print("Unknown error: {0}".format(ex))
