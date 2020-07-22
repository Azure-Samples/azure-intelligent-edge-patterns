"""
Stream models
"""

import logging
import threading
import time
import queue

import cv2

logger = logging.getLogger(__name__)


class Stream():
    """Stream Class"""

    def __init__(self, rtsp, part_id=None, inference=False):
        if rtsp == "0":
            self.rtsp = 0
        elif rtsp == "1":
            self.rtsp = 1
        else:
            self.rtsp = rtsp
        self.part_id = part_id

        self.last_active = time.time()
        self.status = "init"
        self.last_img = None
        self.cur_img_index = 0
        self.last_get_img_index = 0
        self.id = id(self)

        # Thread cv2
        self.cap = None
        self.recieve_thread = threading.Thread(target=self.receive_from_rtsp)
        self.frame_q_maxsize = 100
        self.frame_q = queue.Queue(100)
        self.recieve_thread.start()

        logger.info("stream %s init finish", self.id)

    def receive_from_rtsp(self):
        """receive_from_rtsp

        Receive frame from rtsp and put to queue
        """

        logger.info("start receiving from rtsp")

        self.cap = cv2.VideoCapture(self.rtsp)
        ret, frame = self.cap.read()
        if self.frame_q.qsize() >= self.frame_q_maxsize:
            self.frame_q.get()

        self.frame_q.put(frame)
        while True:
            if not self.cap.isOpened:
                self.cap.release()
                self.cap = cv2.VideoCapture(self.rtsp)
                time.sleep(0.1)
                continue
            ret, frame = self.cap.read()
            if not ret:
                self.cap.release()
                self.cap = cv2.VideoCapture(self.rtsp)
                time.sleep(0.1)
                continue
            if self.frame_q.qsize() >= self.frame_q_maxsize:
                # Dequeue...
                self.frame_q.get()
            self.frame_q.put(frame)
        logger.info("Stop receiving from rtsp....")

    def gen(self):
        """generator for stream
        """

        self.status = "running"

        logger.info("start streaming with %s", self.rtsp)
        logger.info("getting frame from self.frame_q")
        while True:
            if self.frame_q.empty():
                time.sleep(0.01)
            img = self.frame_q.get()
            img = cv2.resize(img, None, fx=0.5, fy=0.5)
            self.last_active = time.time()
            self.last_img = img.copy()
            self.cur_img_index = (self.cur_img_index + 1) % 10000

            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" +
                   cv2.imencode(".jpg", img)[1].tobytes() + b"\r\n")
        # self.cap.release()

    def get_frame(self):
        """get_frame
        """

        logger.info("get frame %s", self)
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
        """close stream
        """

        self.recieve_thread.join()
        self.status = "stopped"
        logger.info("release %s", self)
