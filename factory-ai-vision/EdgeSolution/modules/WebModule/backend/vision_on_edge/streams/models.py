"""App models.
"""

import logging
import threading
import time

import cv2

from configs.general_configs import PRINT_THREAD

from ..cameras.utils import normalize_rtsp, verify_rtsp
from .exceptions import StreamOpenRTSPError

logger = logging.getLogger(__name__)

# Stream
KEEP_ALIVE_THRESHOLD = 10  # Seconds

# Stream Manager
STREAM_GC_TIME_THRESHOLD = 5  # Seconds


class Stream:
    """Stream Class"""

    def __init__(self, rtsp, camera_id, part_id=None):
        self.rtsp = normalize_rtsp(rtsp=rtsp)
        self.camera_id = camera_id
        self.part_id = part_id

        self.last_active = time.time()
        self.status = "init"
        self.cur_img_index = 0
        self.last_get_img_index = 1
        self.id = id(self)

        # test rtsp
        if not verify_rtsp(self.rtsp):
            raise StreamOpenRTSPError
        self.cap = cv2.VideoCapture(self.rtsp)
        self.last_img = self.cap.read()[1]

    def update_keep_alive(self):
        """update_keep_alive."""
        self.last_active = time.time()

    def gen(self):
        """generator for stream."""
        self.status = "running"

        logger.info("Start streaming with %s.", self.rtsp)
        while self.status == "running" and (
            self.last_active + KEEP_ALIVE_THRESHOLD > time.time()
        ):
            if not self.cap.isOpened():
                raise StreamOpenRTSPError
            has_img, img = self.cap.read()
            # Need to add the video flag FIXME
            if not has_img:
                self.cap = cv2.VideoCapture(self.rtsp)
                time.sleep(1)
                continue

            img = cv2.resize(img, None, fx=0.5, fy=0.5)
            self.last_active = time.time()
            self.last_img = img.copy()
            self.cur_img_index = (self.cur_img_index + 1) % 10000
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + cv2.imencode(".jpg", img)[1].tobytes()
                + b"\r\n"
            )
        self.cap.release()
        logger.info("%s cap released.", self)

    def get_frame(self):
        """get_frame."""
        logger.info("%s get frame.", self)
        # b, img = self.cap.read()
        time_begin = time.time()
        while True:
            if time.time() - time_begin > 5:
                break
            if self.last_get_img_index == self.cur_img_index:
                time.sleep(0.01)
            else:
                break
        self.last_get_img_index = self.cur_img_index
        img = self.last_img.copy()
        # if b: return cv2.imencode('.jpg', img)[1].tobytes()
        # else : return None
        return cv2.imencode(".jpg", img)[1].tobytes()

    def close(self):
        """close.

        close the stream.
        """
        self.status = "stopped"
        logger.info("%s stopped.", self)

    def __str__(self):
        return f"<Stream id:{self.id} rtsp:{self.rtsp}>"

    def __repr__(self):
        return f"<Stream id:{self.id} rtsp:{self.rtsp}>"


class StreamManager:
    """StreamManager"""

    def __init__(self):
        self.streams = []
        self.mutex = threading.Lock()
        self.gc()

    def add(self, stream: Stream):
        """add stream"""
        self.mutex.acquire()
        self.streams.append(stream)
        self.mutex.release()

    def get_stream_by_id(self, stream_id):
        """get_stream_by_id"""

        self.mutex.acquire()

        for i in range(len(self.streams)):
            stream = self.streams[i]
            if stream.id == stream_id:

                self.mutex.release()
                return stream

        self.mutex.release()
        return None

    def gc(self):
        """Garbage collector

        IMPORTANT, autoreloader will not reload threading,
        please restart the server if you modify the thread
        """

        def _gc(self):
            while True:
                self.mutex.acquire()
                if PRINT_THREAD:
                    logger.info("streams: %s", self.streams)
                to_delete = []
                for stream in self.streams:
                    if stream.last_active + STREAM_GC_TIME_THRESHOLD < time.time():

                        # stop the inactive stream
                        # (the ones users didnt click disconnect)
                        logger.info("stream %s inactive", stream)
                        logger.info("Time now %s", time.time())
                        logger.info("Stream alive through %s", stream.last_active)
                        stream.close()

                        # collect the stream, to delete later
                        to_delete.append(stream)

                for stream in to_delete:
                    self.streams.remove(stream)

                self.mutex.release()
                time.sleep(3)

        threading.Thread(target=_gc, args=(self,), daemon=True).start()
