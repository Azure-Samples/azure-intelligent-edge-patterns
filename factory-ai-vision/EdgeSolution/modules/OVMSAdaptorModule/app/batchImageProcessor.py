import logging
from PIL import Image, ImageDraw
import io
import numpy as np
import cv2 as cv
import inferencing_pb2
import media_pb2
import extension_pb2

class BatchImageProcessor():
    def __init__(self):
        return
    
    def process_images(self, mediaStreamMessage, rawBytes, size):
        # Read image raw bytes
        im = Image.frombytes('RGB', size, rawBytes.tobytes())
        draw = ImageDraw.Draw(im)
        imgBuf = io.BytesIO()
        im.save(imgBuf, format='JPEG')
        imgBytes = np.frombuffer(imgBuf.getvalue(), dtype=np.uint8)
        
        # Convert to grayscale
        cvGrayImage = cv.imdecode(imgBytes, cv.COLOR_BGR2RGB)
        grayBytes = cvGrayImage.tobytes()

        # Calculate intensity
        totalColor = cvGrayImage.sum()
        avgColor = totalColor / len(grayBytes)
       
        colorIntensity = 'dark' if avgColor < 127 else 'light'

        logging.info('Color intensity: {}'.format(colorIntensity))
        
        inference = mediaStreamMessage.media_sample.inferences.add()
        inference.subtype = 'colorIntensity'
        classification = inferencing_pb2.Classification(
                                        tag = inferencing_pb2.Tag(
                                            value = colorIntensity,
                                            confidence = 1.0
                                        )
                                    )
        inference.classification.CopyFrom(classification)

        return mediaStreamMessage
