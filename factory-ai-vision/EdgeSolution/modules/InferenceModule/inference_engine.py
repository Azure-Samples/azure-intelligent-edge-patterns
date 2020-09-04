import logging
import os
import cv2
import numpy as np
import grpc
import time
import threading
import zmq

import inferencing_pb2
import media_pb2
import extension_pb2
import extension_pb2_grpc

from enum import Enum

from shared_memory import SharedMemoryManager
from exception_handler import PrintGetExceptionDetails
from model_wrapper import YoloV3Model, ONNXRuntimeModelDeploy

# Get debug flag from env variable (Returns None if not set)
# Set this environment variables in the IoTEdge Deployment manifest to activate debugging.
# DEBUG = os.getenv('DEBUG')
DEBUG_OUTPUT_FOLDER = "/lvaextensiondebug"


class TransferType(Enum):
    BYTES = 1           # Embedded Content
    REFERENCE = 2       # Shared Memory
    HANDLE = 3          # Reserved


class State:
    def __init__(self, mediaStreamDescriptor):
        try:
            # media descriptor holding input data format
            self._mediaStreamDescriptor = mediaStreamDescriptor

            # Get how data will be transferred
            if self._mediaStreamDescriptor.WhichOneof("data_transfer_properties") is None:
                self._contentTransferType = TransferType.BYTES
            elif self._mediaStreamDescriptor.HasField("shared_memory_buffer_transfer_properties"):
                self._contentTransferType = TransferType.REFERENCE
            elif self._mediaStreamDescriptor.HasField("shared_memory_segments_transfer_properties"):
                self._contentTransferType = TransferType.HANDLE

            # Setup if shared mem used
            if self._contentTransferType == TransferType.REFERENCE:
                # Create shared memory accessor specific to the client
                self._sharedMemoryManager = SharedMemoryManager(
                    name=self._mediaStreamDescriptor.shared_memory_buffer_transfer_properties.handle_name,
                    size=self._mediaStreamDescriptor.shared_memory_buffer_transfer_properties.length_bytes)
            else:
                self._sharedMemoryManager = None

        except:
            PrintGetExceptionDetails()
            raise


class InferenceEngine(extension_pb2_grpc.MediaGraphExtensionServicer):
    def __init__(self, model):
        # create ONNX model wrapper
        # Thread safe shared resource among all clients
        self._tYoloV3 = model
        self.start_zmq()

    def start_zmq(self):
        def run(self):
            logging.info('running zmq')
            context = zmq.Context()
            sender = context.socket(zmq.PUSH)
            # sender.connect("tcp://localhost:5558")
            sender.bind("tcp://*:5558")

            while 'flags' not in dir(self._tYoloV3.last_drawn_img):
                logging.info('not sending last_drawn_img')
                time.sleep(1)
            cnt = 0
            while True:
                cnt += 1
                sender.send_pyobj(
                    {"data": cv2.imencode(".jpg", self._tYoloV3.last_drawn_img)[1].tobytes(), "ts": str(cnt), "shape": (540, 960, 3)})
                # sender.send(cv2.imencode(".jpg", onnx.last_img)[1].tostring())
                # time.sleep(2)
                time.sleep(0.04)
        threading.Thread(target=run, args=(self,)).start()

    # Debug method for dumping received images with analysis results
    def CreateDebugOutput(self, requestSeqNum, cvImage, boxes, scores, indices, confidenceThreshold=0.1):
        try:
            marked = False

            for idx in indices:
                confidenceScore = scores[tuple(idx)].tolist()
                if confidenceScore >= confidenceThreshold:
                    objectLabel = self._tYoloV3._labelList[idx[1].tolist()]

                    idxTuple = (idx[0], idx[2])
                    ymin, xmin, ymax, xmax = boxes[idxTuple].tolist()

                    cv2.rectangle(cvImage, (int(xmin), int(ymin)),
                                  (int(xmax), int(ymax)), (255, 0, 0), 2)
                    cv2.putText(cvImage, objectLabel + " - " + str(confidenceScore), (int(
                        xmin), int(ymin - 7)), cv2.FONT_HERSHEY_COMPLEX, 0.3, (255, 0, 0), 1)
                    marked = True

            # Set output file name
            if marked:
                outputFileName = os.path.join(
                    DEBUG_OUTPUT_FOLDER, str(requestSeqNum) + '_marked.jpg')
            else:
                outputFileName = os.path.join(
                    DEBUG_OUTPUT_FOLDER, str(requestSeqNum) + '.jpg')

            # output with bounding boxes
            cv2.imwrite(outputFileName, cvImage)
        except:
            PrintGetExceptionDetails()
            raise

    def GetMediaStreamMessageResponse(self, predictions, imgShape, confidenceThreshold=0.1):
        try:
            msg = extension_pb2.MediaStreamMessage()

            ih, iw, _ = imgShape

            for prediction in predictions:
                confidenceScore = prediction['probability']
                if confidenceScore >= confidenceThreshold:
                    objectLabel = prediction['tagName']

                    inference = msg.media_sample.inferences.add()
                    inference.type = inferencing_pb2.Inference.InferenceType.ENTITY
                    inference.entity.CopyFrom(inferencing_pb2.Entity(
                        tag=inferencing_pb2.Tag(
                            value=objectLabel,
                            confidence=confidenceScore
                        ),
                        box=inferencing_pb2.Rectangle(
                            l=prediction['boundingBox']['left'],
                            t=prediction['boundingBox']['top'],
                            w=prediction['boundingBox']['width'],
                            h=prediction['boundingBox']['height'],
                        )
                    )
                    )
            return msg
        except:
            PrintGetExceptionDetails()
            raise

    def GetCvImageFromRawBytes(self, clientState, mediaSample):
        try:
            # Get reference to raw bytes
            if clientState._contentTransferType == TransferType.BYTES:
                rawBytes = memoryview(
                    mediaSample.content_bytes.bytes).toreadonly()
            elif clientState._contentTransferType == TransferType.REFERENCE:
                # Data sent over shared memory buffer
                addressOffset = mediaSample.content_reference.address_offset
                lengthBytes = mediaSample.content_reference.length_bytes

                # Get memory reference to (in readonly mode) data sent over shared memory
                rawBytes = clientState._sharedMemoryManager.ReadBytes(
                    addressOffset, lengthBytes)

            # Get encoding details of the media sent by client
            encoding = clientState._mediaStreamDescriptor.media_descriptor.video_frame_sample_format.encoding

            # Handle JPG, PNG, BMP content
            cvImage = None
            if encoding == clientState._mediaStreamDescriptor.media_descriptor.video_frame_sample_format.Encoding.JPG or \
                    encoding == clientState._mediaStreamDescriptor.media_descriptor.video_frame_sample_format.Encoding.PNG or \
                    encoding == clientState._mediaStreamDescriptor.media_descriptor.video_frame_sample_format.Encoding.BMP:

                # np.frombuffer is zero copy command
                cvImage = cv2.imdecode(np.frombuffer(
                    rawBytes, dtype=np.uint8), -1)

            # Handle RAW content (Just place holder for the user to handle each variation...)
            elif encoding == clientState._mediaStreamDescriptor.media_descriptor.video_frame_sample_format.Encoding.RAW:
                pixelFormat = clientState._mediaStreamDescriptor.media_descriptor.video_frame_sample_format.pixel_format
                if pixelFormat == media_pb2.VideoFrameSampleFormat.PixelFormat.RGBA:
                    cvImage = cv2.cvtColor(np.frombuffer(
                        rawBytes, dtype=np.uint8), cv2.COLOR_RGBA2RGB)
                elif pixelFormat == media_pb2.VideoFrameSampleFormat.PixelFormat.YUV420P:
                    cvImage = None

            return cvImage

        except:
            PrintGetExceptionDetails()
            raise

    def ProcessMediaStream(self, requestIterator, context):
        # Below logic can be extended into multi-process (per CPU cores, i.e. in case using CPU inferencing)
        # For simplicity below, we use single process to handle gRPC clients

        # Auto increment counter. Increases per client requests
        responseSeqNum = 1

        # First message from the client is (must be) MediaStreamDescriptor
        mediaStreamMessageRequest = next(requestIterator)

        # Extract message IDs
        requestSeqNum = mediaStreamMessageRequest.sequence_number
        requestAckSeqNum = mediaStreamMessageRequest.ack_sequence_number

        # State object per client
        clientState = State(mediaStreamMessageRequest.media_stream_descriptor)

        logging.info('Connection created with peer {0}.\nMediaStreamDescriptor:\n{1}'.format(
            context.peer(), clientState._mediaStreamDescriptor))
        logging.debug('[Received] SeqNum: {0:07d} | AckNum: {1}'.format(
            requestSeqNum, requestAckSeqNum))

        # First message response ...
        mediaStreamMessage = extension_pb2.MediaStreamMessage(
            sequence_number=responseSeqNum,
            ack_sequence_number=requestSeqNum,
            media_stream_descriptor=extension_pb2.MediaStreamDescriptor(
                media_descriptor=media_pb2.MediaDescriptor(
                    timescale=clientState._mediaStreamDescriptor.media_descriptor.timescale
                )
            )
        )
        yield mediaStreamMessage

        # Process rest of the MediaStream message sequence
        for mediaStreamMessageRequest in requestIterator:
            try:
                # Increment response counter, will be sent to client
                responseSeqNum += 1

                # Read request id, sent by client
                requestSeqNum = mediaStreamMessageRequest.sequence_number

                logging.debug(
                    '[Received] SeqNum: {0:07d}'.format(requestSeqNum))

                # Get media content bytes. (bytes sent over shared memory buffer, segment or inline to message)
                cvImage = self.GetCvImageFromRawBytes(
                    clientState, mediaStreamMessageRequest.media_sample)

                if cvImage is None:
                    message = "Can't decode received bytes."
                    logging.info(message)
                    context.set_details(message)
                    context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                    return

                if list(cvImage.shape[:2]) != self._tYoloV3.image_shape:
                    message = "Received an image of size {0}, but expected one of size {1}".format(
                        cvImage.shape[:2], self._tYoloV3.image_shape)
                    context.set_details(message)
                    logging.info(message)
                    context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                    return

                # run inference
                logging.info(self._tYoloV3)
                # out = self._tYoloV3.Score(cvImage)
                # logging.info(out)
                predictions = self._tYoloV3.Score(cvImage)

                logging.debug(
                    'Detected {0} inferences'.format(len(predictions)))

                # if DEBUG is not None:
                #     self.CreateDebugOutput(
                #         requestSeqNum, cvImage, boxes, scores, indices)

                # Check client connection state
                if context.is_active():
                    # return inference result as MediaStreamMessage
                    mediaStreamMessage = self.GetMediaStreamMessageResponse(
                        predictions, cvImage.shape)

                    mediaStreamMessage.sequence_number = responseSeqNum
                    mediaStreamMessage.ack_sequence_number = requestSeqNum
                    mediaStreamMessage.media_sample.timestamp = mediaStreamMessageRequest.media_sample.timestamp

                    # yield response
                    yield mediaStreamMessage
                else:
                    break
            except:
                PrintGetExceptionDetails()

        logging.info('Connection closed with peer {0}.'.format(context.peer()))
