"""
Stream models
"""
import logging
import sys
import threading
import time

import cv2
import requests
from azure.iot.device import IoTHubModuleClient

from ..azure_iot.utils import inference_module_url

logger = logging.getLogger(__name__)

KEEP_ALIVE_THRESHOLD = 10


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

        self.mutex = threading.Lock()
        self.predictions = []
        self.inference = inference
        self.iot = None
        self.keep_alive = time.time()
        try:
            self.iot = IoTHubModuleClient.create_from_edge_environment()
        except KeyError as key_error:
            logger.error(key_error)
        except OSError as os_error:
            logger.error(os_error)
        except Exception:
            logger.exception("Unexpected error")

        logger.info("inference %s", self.inference)
        logger.info("iot %s", self.iot)

        def _listener(self):
            if not self.inference:
                return
            while True:
                if self.last_active + 10 < time.time():
                    print("[INFO] stream finished")
                    break
                sys.stdout.flush()
                res = requests.get("http://" + inference_module_url() +
                                   "/prediction")

                self.mutex.acquire()
                self.predictions = res.json()
                self.mutex.release()
                time.sleep(0.02)
                # print('received p', self.predictions)

                # inference = self.iot.receive_message_on_input('inference',
                #                                               timeout=1)
                # if not inference:
                #    self.mutex.acquire()
                #    self.bboxes = []
                #    self.mutex.release()
                # else:
                #    data = json.loads(inference.data)
                #    print('receive inference', data)
                #    self.mutex.acquire()
                #    self.bboxes = [{
                #        'label': data['Label'],
                #        'confidence': data['Confidence'] + '%',
                #        'p1': (data['Position'][0], data['Position'][1]),
                #        'p2': (data['Position'][2], data['Position'][3])
                #    }]
                #    self.mutex.release()

        # if self.iot:
        threading.Thread(target=_listener, args=(self,)).start()

    def update_keep_alive(self):
        self.keep_alive = time.time()

    def gen(self):
        """generator for stream"""
        self.status = "running"
        logger.info("start streaming with %s", self.rtsp)
        self.cap = cv2.VideoCapture(self.rtsp)
        while self.status == "running" and (
                self.keep_alive + KEEP_ALIVE_THRESHOLD > time.time()):
            if not self.cap.isOpened():
                raise ValueError("Cannot connect to rtsp")
            t, img = self.cap.read()
            # Need to add the video flag FIXME
            if t == False:
                self.cap = cv2.VideoCapture(self.rtsp)
                time.sleep(1)
                continue

            img = cv2.resize(img, None, fx=0.5, fy=0.5)
            self.last_active = time.time()
            self.last_img = img.copy()
            self.cur_img_index = (self.cur_img_index + 1) % 10000
            self.mutex.acquire()
            predictions = list(
                prediction.copy() for prediction in self.predictions)
            self.mutex.release()

            # print('bboxes', bboxes)
            # cv2.rectangle(img, bbox['p1'], bbox['p2'], (0, 0, 255), 3)
            # cv2.putText(img, bbox['label'] + ' ' + bbox['confidence'],
            # (bbox['p1'][0], bbox['p1'][1]-15),
            # cv2.FONT_HERSHEY_COMPLEX,
            # 0.6,
            # (0, 0, 255),
            # 1)
            height, width = img.shape[0], img.shape[1]
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 1
            thickness = 3
            for prediction in predictions:
                if prediction["probability"] > 0.25:
                    x1 = int(prediction["boundingBox"]["left"] * width)
                    y1 = int(prediction["boundingBox"]["top"] * height)
                    x2 = x1 + int(prediction["boundingBox"]["width"] * width)
                    y2 = y1 + int(prediction["boundingBox"]["height"] * height)
                    img = cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255),
                                        2)
                    img = cv2.putText(
                        img,
                        prediction["tagName"],
                        (x1 + 10, y1 + 30),
                        font,
                        font_scale,
                        (0, 0, 255),
                        thickness,
                    )
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" +
                   cv2.imencode(".jpg", img)[1].tobytes() + b"\r\n")
        print('RELEASSSSIINNNGGG')
        self.cap.release()

    def get_frame(self):
        """Get frame"""
        print("[INFO] get frame", self)
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
        """close stream"""
        self.status = "stopped"
        logger.info("release %s", self)
