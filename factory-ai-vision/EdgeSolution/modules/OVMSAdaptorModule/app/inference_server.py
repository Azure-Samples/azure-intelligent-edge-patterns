import sys
import logging
import os
import inferencing_pb2
import media_pb2
import extension_pb2
import extension_pb2_grpc
#from batchImageProcessor import BatchImageProcessor
from ovms_batchImageProcessor import OVMSBatchImageProcessor
from enum import Enum
from shared_memory import SharedMemoryManager
from exception_handler import PrintGetExceptionDetails

# Get debug flag from env variable (Returns None if not set)
# Set this environment variables in the IoTEdge Deployment manifest to activate debugging.
# You should also map the DebugOutputFolder on the host machine to write out the debug frames...
DEBUG = os.getenv('Debug')
DEBUG_OUTPUT_FOLDER = os.getenv('DebugOutputFolder')

class TransferType(Enum):
    BYTES = 1           # Embedded Content
    REFERENCE = 2       # Shared Memory
    HANDLE = 3          # Reserved...

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

class InferenceServer(extension_pb2_grpc.MediaGraphExtensionServicer):
    def __init__(self, batchSize):
        self.processor = OVMSBatchImageProcessor()
        self.batchSize = batchSize
        return

    def process_media_sample(self, mediaStreamMessage, imageDetails):
        #Get media content bytes. (bytes sent over shared memory buffer, segment or inline to message)  
        try:
            rawBytes, size = imageDetails
            return self.processor.process_images(mediaStreamMessage, rawBytes, size)
       
        except:
            PrintGetExceptionDetails()
            raise
        
        return None

    def get_image_details(self, clientState, mediaStreamMessageRequest):
        #Get media content bytes. (bytes sent over shared memory buffer, segment or inline to message)  
        try:
            # Get reference to raw bytes
            if clientState._contentTransferType == TransferType.BYTES:
                rawBytes = memoryview(mediaStreamMessageRequest.media_sample.content_bytes.bytes)
            elif clientState._contentTransferType == TransferType.REFERENCE:
                # Data sent over shared memory buffer
                addressOffset = mediaStreamMessageRequest.media_sample.content_reference.address_offset
                lengthBytes = mediaStreamMessageRequest.media_sample.content_reference.length_bytes
                
                # Get memory reference to (in readonly mode) data sent over shared memory
                rawBytes = clientState._sharedMemoryManager.ReadBytes(addressOffset, lengthBytes)

            # Get encoding details of the media sent by client
            encoding = clientState._mediaStreamDescriptor.media_descriptor.video_frame_sample_format.encoding    

            # Handle RAW content (Just place holder for the user to handle each variation...)
            if encoding == clientState._mediaStreamDescriptor.media_descriptor.video_frame_sample_format.Encoding.RAW:
                width = clientState._mediaStreamDescriptor.media_descriptor.video_frame_sample_format.dimensions.width
                height = clientState._mediaStreamDescriptor.media_descriptor.video_frame_sample_format.dimensions.height

                return rawBytes, (width, height)
            else:
                raise Exception('Sample format is not RAW')
        
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
        
        logging.info('[Received] SeqNum: {0:07d} | AckNum: {1}\nMediaStreamDescriptor:\n{2}'.format(requestSeqNum, requestAckSeqNum, clientState._mediaStreamDescriptor))

        # First message response ...
        mediaStreamMessage = extension_pb2.MediaStreamMessage(
                                    sequence_number = responseSeqNum,
                                    ack_sequence_number = requestSeqNum,
                                    media_stream_descriptor = extension_pb2.MediaStreamDescriptor(
                                        media_descriptor = media_pb2.MediaDescriptor(
                                            timescale = clientState._mediaStreamDescriptor.media_descriptor.timescale
                                        )
                                    )
                                )
        # Send acknowledge message to client    
        yield mediaStreamMessage

        width = clientState._mediaStreamDescriptor.media_descriptor.video_frame_sample_format.dimensions.width
        height = clientState._mediaStreamDescriptor.media_descriptor.video_frame_sample_format.dimensions.height
 
        # Process rest of the MediaStream message sequence
        messageCount = 0
        imageBatch = []
        for mediaStreamMessageRequest in requestIterator:
            try:
                # Read request id, sent by client
                requestSeqNum = mediaStreamMessageRequest.sequence_number
                timestamp = mediaStreamMessageRequest.media_sample.timestamp
                        
                logging.info('[Received] SequenceNum: {0:07d}'.format(requestSeqNum))

                imageDetails = self.get_image_details(clientState, mediaStreamMessageRequest)
                # Increment request sequence number
                responseSeqNum += 1

                if(messageCount < self.batchSize):
                    # Add images to batch and create acknowledge message
                    logging.info('Adding image #{0} to batch.'.format(messageCount+1))
                    mediaStreamMessage = extension_pb2.MediaStreamMessage(
                                            sequence_number = responseSeqNum,
                                            ack_sequence_number = requestSeqNum
                                            )
                    imageBatch.append(imageDetails)    
                    messageCount += 1
                else:
                    # Process batch
                    logging.info('Processing batch ({0}).'.format(messageCount))
                    mediaStreamMessage = extension_pb2.MediaStreamMessage()
                    for image in imageBatch:
                        mediaStreamMessage = self.process_media_sample(mediaStreamMessage, image)

                    if(mediaStreamMessage is None):
                        # Respond with message without inferencing
                        mediaStreamMessage = extension_pb2.MediaStreamMessage()     
                        responseStatusMessage = "empty message for request seq = " + str(mediaStreamMessage.ack_sequence_number) + " response seq = " + str(responseSeqNum)
                    else:
                        responseStatusMessage = "responding for message with request seq = " + str(mediaStreamMessage.ack_sequence_number) + " response seq = " + str(responseSeqNum)

                    logging.info(responseStatusMessage)
                    mediaStreamMessage.sequence_number = responseSeqNum
                    mediaStreamMessage.ack_sequence_number = mediaStreamMessageRequest.sequence_number
                    mediaStreamMessage.media_sample.timestamp = mediaStreamMessageRequest.media_sample.timestamp

                    # Clear batch
                    imageBatch.clear()
                    messageCount = 0

                if context.is_active():
                    # yield response                        
                    yield mediaStreamMessage    
                else:
                    break
            except:
                PrintGetExceptionDetails()

        logging.info('Done processing messages')
