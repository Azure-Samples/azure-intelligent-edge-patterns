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
        ip = socket.gethostbyname('InferenceModule')
        return 'tcp://' + ip + ':5558'
    return 'tcp://localhost:5558'


class VideoFeed():
    """VideoFeed.
    """

    def __init__(self):
        self.keep_alive = time.time()
        self.last_active = time.time()
        self.context = zmq.Context()
        self.mutex = threading.Lock()
        self.is_opened = True
        self.receiver = self.context.socket(zmq.PULL)

    def gen(self):
        """gen

        video feed genarator
        """

        # context = zmq.Context()
        # receiver = context.socket(zmq.PULL)
        self.receiver.connect(inference_url())

        while self.is_opened:
            ret = self.receiver.recv_pyobj()

            nparr = np.frombuffer(np.array(ret['data']), np.uint8)

            # logger.warning('Receive: %s', ret['ts'])
            # logger.warning('Time elapsed: %s', (time.time()-self.keep_alive))
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # ret2 = receiver.recv_pyobj()
            # logger.warning(ret2['ts'])
            # logger.warning(ret2['shape'])

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' +
                   cv2.imencode('.jpg', img)[1].tobytes() + b'\r\n')
        self.receiver.close()

    def update_keep_alive(self):
        """update_keep_alive.
        """
        self.keep_alive = time.time()

    def close(self):
        """close connection
        """
        self.is_opened = False
        # self.receiver.close()
        logger.warning('connection close')
