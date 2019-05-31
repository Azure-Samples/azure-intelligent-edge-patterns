# ---------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# ---------------------------------------------------------
"""Score on deployed AzureML accelerated models webservices."""
import grpc
import time
from datetime import datetime, timedelta

try:
    from tensorflow_serving.apis import predict_pb2
    from tensorflow_serving.apis import prediction_service_pb2_grpc
except ImportError:
    from .external.tensorflow_serving.apis import predict_pb2
    from .external.tensorflow_serving.apis import prediction_service_pb2_grpc

try:
    import tensorflow as tf
    from tensorflow.core.framework import tensor_shape_pb2
    from tensorflow.core.framework import types_pb2
except ImportError:
    raise ImportError("azureml-brainwave requires tensorflow version >= 1.6 and you don't have it "
                      "installed.")



class PredictionClient:
    """Scoring client for AzureML accelerated models."""

    def __init__(self, address: str, port: int = None, use_ssl: bool = False, access_token: str = None,
                 service_name: str = None, channel_shutdown_timeout: timedelta = timedelta(minutes=2)):
        """Create a prediction client.

        :param address: Host name of the service.
        :param port: Port of the service to connect to.
        :param use_ssl: If the client should use SSL to connect.
        :param access_token: Access token key for the webservice.
        :param channel_shutdown_timeout: Timeout after which channel should reconnect.
        """
        if (address is None):
            raise ValueError("address")

        if (port is None):
            if use_ssl:
                port = 443
            else:
                port = 80

        if access_token is None:
            access_token = ""
        if service_name is None:
            service_name = ""

        host = "{0}:{1}".format(address, port)

        self.metadata= [('authorization', 'Bearer {0}'.format(access_token)),
                        ('x-ms-aml-grpc-service-route',service_name)]
        grpc.composite_channel_credentials(grpc.ssl_channel_credentials())

        if use_ssl:
            self._channel_func = lambda: grpc.secure_channel(host, grpc.ssl_channel_credentials())
        else:
            self._channel_func = lambda: grpc.insecure_channel(host)

        self.__channel_shutdown_timeout = channel_shutdown_timeout
        self.__channel_usable_until = None
        self.__channel = None

    def score_file(self, path: str, input_name = 'images', outputs = None, timeout: float = 10.0):
        """Score a single image file by passing file bytes as string tensor.

        :param input_name: Input name to send the tensor with
        :param outputs: Either string or list of strings specifying output tensors name to retreive.
        :param path: Path of the image file to score.
        :param timeout: Timeout in seconds.
        :return: The result of prediction, with batch dimension removed. For outputs a string, a single numpy array. For outputs a list, a list of numpy arrays.
        """
        with open(path, 'rb') as f:
            data = f.read()
            input_map = {input_name:(data, [1], types_pb2.DT_STRING)}
            result = self.score_tensors(input_map, outputs, timeout)
            
            # result is a batch, but the API only allows a single image so we return the
            # single item of the batch here
            if isinstance(result, list):            
                for ndarray in result:
                    ndarray = ndarray[0]
            else:
                result = result[0]

            return result

    def score_string(self, input_string: str, input_name = 'images', outputs = None, timeout: float = 10.0):
        """Score a single image file by passing file bytes as string tensor.

        :param input_name: Input name to send the tensor with
        :param outputs: Either string or list of strings specifying output tensors name to retreive.
        :param path: Path of the image file to score.
        :param timeout: Timeout in seconds.
        :return: The result of prediction, with batch dimension removed. For outputs a string, a single numpy array. For outputs a list, a list of numpy arrays.
        """
        data = input_string
        input_map = {input_name:(data, [1], types_pb2.DT_STRING)}
        result = self.score_tensors(input_map, outputs, timeout)
        
        # result is a batch, but the API only allows a single image so we return the
        # single item of the batch here
        if isinstance(result, list):            
            for ndarray in result:
                ndarray = ndarray[0]
        else:
            result = result[0]

        return result

    def score_numpy_arrays(self, input_map, outputs = None):
        """Score a numpy array.

        :param input_map: Dictionary of tensor names to numpy arrays to feed for scoring
        :param outputs: Either string or list of strings specifying output tensors name to retreive.
        :param input_name: Input name to send the array with.
        :return: Numpy array with the predicted values. For outputs a string, a single numpy array. For outputs a list, a list of numpy arrays.
        """
        request = predict_pb2.PredictRequest()
        for input_name in input_map:
            npdata = input_map[input_name]
            request.inputs[input_name].CopyFrom(tf.contrib.util.make_tensor_proto(npdata, None, npdata.shape))
        return self.__predict(request, 30.0, outputs)        


    def score_tensors(self, input_map, outputs = None, timeout: float = 10.0):
        """Score a tensor.

        :param input_map: Dictionary mapping tensor names to feed tuple of (data as bytes, shape as list[int], datatype as TensorFlow types_pb2)
        :param outputs: Either string or list of strings specifying output tensors name to retreive.
        :param timeout: Timeout of the request in seconds
        :return: Numpy array with the predicted values. For outputs a string, a single numpy array. For outputs a list, a list of numpy arrays.
        """        
        request = predict_pb2.PredictRequest()
        for input_name in input_map:
            data, shape, datatype = input_map[input_name]
            dtype = tf.as_dtype(datatype)
            if dtype == tf.string:
                request.inputs[input_name].string_val.append(data)
            else:
                request.inputs[input_name].tensor_content.append(data)
                
            request.inputs[input_name].dtype = datatype
            request.inputs[input_name].tensor_shape.dim.extend(self._make_dim_list(shape))
            
        return self.__predict(request, timeout, outputs=outputs)

    @staticmethod
    def _make_dim_list(shape: list):
        ret_list = []
        for val in shape:
            dim = tensor_shape_pb2.TensorShapeProto.Dim()
            dim.size = val
            ret_list.append(dim)
        return ret_list

    def _get_datetime_now(self):
        return datetime.now()

    def _get_grpc_stub(self):
        if self.__channel_usable_until is None or self.__channel_usable_until < self._get_datetime_now():
            self.__reinitialize_channel()
        self.__channel_usable_until = self._get_datetime_now() + self.__channel_shutdown_timeout
        return self.__stub

    def __predict(self, request, timeout, outputs = None):
        retry_count = 5
        sleep_delay = 1

        while True:
            try:
                result = self._get_grpc_stub().Predict(request, timeout, metadata = self.metadata)
                output_names = outputs
                if output_names:
                    # fetch requested as string, directly return tensor requested
                    if isinstance(output_names, str):
                        return tf.contrib.util.make_ndarray(result.outputs[output_names])                    
                    key_source = output_names
                else:
                    # default fetch contains single tensor, directly return
                    if len(result.outputs) == 1:
                        for name in result.outputs:
                            return tf.contrib.util.make_ndarray(result.outputs[name]) 
                    key_source = result.outputs

                # otherwise return as list of numpy arrays instead
                return_ndarrays = []
                for name in key_source:
                    #print(name)
                    #print(list(result.outputs.keys()))
                    #print(result.outputs[name])
                    return_ndarrays.append(tf.contrib.util.make_ndarray(result.outputs[name]))
                return return_ndarrays
            except grpc.RpcError as rpcError:
                # Get the inital metadata from the RpcError and
                # add it to our list of request ids to give back to the customer
                retry_count = retry_count - 1
                if (retry_count <= 0 or
                        (hasattr(rpcError, "code") and rpcError.code() is grpc.StatusCode.INVALID_ARGUMENT)):
                    raise
                time.sleep(sleep_delay)
                sleep_delay = sleep_delay * 2
                print("Retrying", rpcError)
                self.__reinitialize_channel()

    def __reinitialize_channel(self):
        self.__stub = None
        if self.__channel is not None:
            self.__channel.close()
        self.__channel = self._channel_func()
        self.__stub = prediction_service_pb2_grpc.PredictionServiceStub(self.__channel)
