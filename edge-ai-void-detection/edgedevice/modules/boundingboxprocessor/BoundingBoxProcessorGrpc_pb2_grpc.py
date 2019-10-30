# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
import grpc

import BoundingBoxProcessorGrpc_pb2 as BoundingBoxProcessorGrpc__pb2


class GrpcChannelStub(object):
  """The BoundingBoxProcessorGrpc service definition.
  """

  def __init__(self, channel):
    """Constructor.

    Args:
      channel: A grpc.Channel.
    """
    self.SubmitImage = channel.unary_unary(
        '/BoundingBoxProcessorGrpc.GrpcChannel/SubmitImage',
        request_serializer=BoundingBoxProcessorGrpc__pb2.ImageData.SerializeToString,
        response_deserializer=BoundingBoxProcessorGrpc__pb2.ImageReply.FromString,
        )


class GrpcChannelServicer(object):
  """The BoundingBoxProcessorGrpc service definition.
  """

  def SubmitImage(self, request, context):
    """Sends an image
    """
    context.set_code(grpc.StatusCode.UNIMPLEMENTED)
    context.set_details('Method not implemented!')
    raise NotImplementedError('Method not implemented!')


def add_GrpcChannelServicer_to_server(servicer, server):
  rpc_method_handlers = {
      'SubmitImage': grpc.unary_unary_rpc_method_handler(
          servicer.SubmitImage,
          request_deserializer=BoundingBoxProcessorGrpc__pb2.ImageData.FromString,
          response_serializer=BoundingBoxProcessorGrpc__pb2.ImageReply.SerializeToString,
      ),
  }
  generic_handler = grpc.method_handlers_generic_handler(
      'BoundingBoxProcessorGrpc.GrpcChannel', rpc_method_handlers)
  server.add_generic_rpc_handlers((generic_handler,))
