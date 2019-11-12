# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for
# full license information.

import cv2
from datetime import datetime
import numpy as np
import requests

import ImageProcessorGrpc_pb2
import VideoStream
from VideoStream import VideoStream


def format_image_utc_time(time: datetime = None):
    """
    Format a datetime object to millisecond precision, suitable for the
    basename of a file for upload to blob storage.
    """
    if time is None:
        time = datetime.utcnow()
    return time.isoformat()[0:-3] + 'Z'

class SingleImageSource:
    """A camera image source that provides a single canned image."""
    def __init__(self):
        self.image_bytes = None
        with open("simulated-images/counter.jpg", "rb") as f:
            self.image_bytes = f.read()

    def get_image(self):
        return self.image_bytes


class HTTPSource:
    """A camera image source that retrieves an image from an HTTP camera."""
    def __init__(self, url):
        self.url = url

    def get_image(self):
        resp = requests.get(self.url)
        if resp.status_code == 200:
            return resp.content
        return None


class RTSPSource:
    """A camera image source that retrieves an image from an RTSP camera."""
    def __init__(self, url):
        self.url = url
        self.capture = VideoStream(url).start()

    def get_image(self):
        return self.capture.read()


class Camera:
    """Represents a single camera.

    The camera can retrieve its images from any number of input sources.
    """
    def __init__(self, camera_info):
        self.id = camera_info["id"]
        self.type = camera_info["type"]
        self.url = camera_info["url"]
        self.seconds_between_images = camera_info["secondsBetweenImages"]
        self.image_source = None
        if self.type.lower() == "simulator":
            self.image_source = SingleImageSource()
        elif self.type.lower() == "http":
            self.image_source = HTTPSource(self.url)
        elif self.type.lower() == "rtsp":
            self.image_source = RTSPSource(self.url)
        else:
            print('Unrecognized camera type "{}"'.format(self.type))

    def get_image(self):
        """Retrieve an image from the camera.

        This function returns an ImageBody object that contains information
        about the image, the original image itself, and a 300x300 image decoded
        into its RGB components.
        """
        if self.image_source:
            image_bytes = self.image_source.get_image()
            if image_bytes is None:
                return None
            now_string = format_image_utc_time()
            #small_img = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)
            a = np.fromstring(image_bytes, dtype = 'uint8')
            small_img = cv2.imdecode(a, cv2.IMREAD_COLOR)
            small_img = cv2.resize(small_img, (300, 300), cv2.INTER_AREA)
            small_img = cv2.cvtColor(small_img, cv2.COLOR_BGR2RGB)
            rv = ImageProcessorGrpc_pb2.ImageBody()
            rv.cameraId = self.id
            rv.time = now_string
            rv.type = "jpg"
            rv.image = image_bytes
            rv.smallImageRGB = small_img.tobytes()
            return rv
        else:
            return None
