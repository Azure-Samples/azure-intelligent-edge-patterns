"""
Models
"""

import logging
import socket
import threading
import time

import cv2
import numpy as np
import zmq

from vision_on_edge.azure_app_insight.utils import get_app_insight_logger
from vision_on_edge.azure_iot.utils import is_edge
from vision_on_edge.azure_settings.models import Setting

logger = logging.getLogger(__name__)


def inference_url():
    if is_edge():
        ip = socket.gethostbyname("InferenceModule")
        return "tcp://" + ip + ":5558"
    return "tcp://localhost:5558"


class VideoFeed:
    """VideoFeed."""

    def __init__(self, camera_id):
        self.keep_alive = time.time()
        self.last_active = time.time()
        self.context = zmq.Context()
        self.mutex = threading.Lock()
        self.camera_id = camera_id
        self.is_opened = True
        self.receiver = self.context.socket(zmq.SUB)
        self.receiver.setsockopt(zmq.SUBSCRIBE, bytes(self.camera_id, "utf-8"))
        self.receiver.connect(inference_url())
        self.buf = None
        self.start()

    def start(self):
        def _start(self):
            while self.is_opened:
                self.buf = self.receiver.recv_multipart()
            self.receiver.close()

        threading.Thread(target=_start, args=(self,)).start()

    def gen(self):
        """gen

        video feed genarator
        """
        print("*****GENERATOR *****", flush=True)
        count = 0
        while self.is_opened:
            if self.buf is not None:
                if len(self.buf[1]) < 100:
                    print(
                        "[WARNING] channel",
                        self.buf[0],
                        "frame size only",
                        len(self.buf[1]),
                        flush=True,
                    )
                elif len(self.buf[1]) >= 100:
                    count += 1
                    if count % 100 == 0:
                        print(
                            "[INFO] sampling channel",
                            self.buf[0],
                            "frame size",
                            len(self.buf[1]),
                            flush=True,
                        )
                    yield (
                        b"--frame\r\n"
                        b"Content-Type: image/jpeg\r\n\r\n" + self.buf[1] + b"\r\n\r\n"
                    )
            time.sleep(0.03)

    def update_keep_alive(self):
        """update_keep_alive."""
        self.keep_alive = time.time()

    def close(self):
        """close connection"""
        self.is_opened = False
        # self.receiver.close()
        logger.warning("connection close")
