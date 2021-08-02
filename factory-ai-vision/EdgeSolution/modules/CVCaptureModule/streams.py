import base64
import json
import logging
import os
import threading
import time

import cv2
import numpy as np
import requests

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

IMG_WIDTH = 960
IMG_HEIGHT = 540


class Stream:
    def __init__(self, cam_id, cam_source, fps, endpoint, sender):
        self.cam_id = cam_id

        self.mutex = threading.Lock()

        self.cam_source = cam_source

        self.endpoint = endpoint
        # if self.model.is_gpu:
        #     frameRate = 30
        # else:
        #     frameRate = 10
        self.cam = None
        self.fps = max(0.1, fps)
        self.cam_is_alive = True

        self.IMG_WIDTH = 960
        self.IMG_HEIGHT = 540
        self.image_shape = [540, 960]

        self.last_img = None
        self.last_update = None
        self.last_send = None
        self.edge = '960'

        self.zmq_sender = sender
        self.start_http()
        # self.start_zmq()

    def start_http(self):
        def _new_streaming(self):
            cnt = 0
            endpoint = self.endpoint + " /predict_opencv?camera_id=" + self.cam_id + '&edge=' + self.edge
            if self.cam_source == "0":
                self.cam = cv2.VideoCapture(0)
            else:
                self.cam = cv2.VideoCapture(self.cam_source)

            if self.cam.isOpened():
                cam_fps = self.cam.get(cv2.CAP_PROP_FPS)
                if cam_fps > 0.0 and cam_fps < self.fps:
                    self.fps = cam_fps

            while self.cam_is_alive:
                cnt += 1
                is_ok, img = self.cam.read()
                if is_ok:

                    width = IMG_WIDTH
                    ratio = IMG_WIDTH / img.shape[1]
                    height = int(img.shape[0] * ratio + 0.000001)
                    if height >= self.IMG_HEIGHT:
                        height = self.IMG_HEIGHT
                        ratio = self.IMG_HEIGHT / img.shape[0]
                        width = int(img.shape[1] * ratio + 0.000001)
                        self.edge = '540'

                    img = cv2.resize(img, (width, height))

                    self.last_img = img
                    self.last_update = time.time()
                    time.sleep(1 / self.fps)
                    # print(jpg)
                else:
                    self.restart_cam()
                    time.sleep(1)

            logger.warning("Stream {} finished".format(self.cam_id))
            self.cam.release()

        def run_send(self):
            cnt = 0
            while self.cam_is_alive:
                if self.last_img is None:
                    logger.warning(
                        "stream {} img not ready".format(self.cam_id))
                    time.sleep(1)
                    continue
                if self.last_send == self.last_update:
                    # logger.warning('no new img')
                    time.sleep(1 / self.fps)
                    continue
                cnt += 1
                if cnt % 30 == 1:
                    logger.warning(
                        "send through channel {} to inference server , count = {}".format(
                            bytes(self.cam_id, "utf-8"), cnt
                        )
                    )
                # data = cv2.imencode(".jpg", self.last_img)[1].tobytes()
                data = self.last_img.tobytes()
                endpoint = self.endpoint + " /predict_opencv?camera_id=" + self.cam_id + '&edge=' + self.edge
                res = requests.post(endpoint, data=data)
                self.last_send = self.last_update
                time.sleep(1 / self.fps)

        threading.Thread(target=_new_streaming,
                         args=(self,), daemon=True).start()
        threading.Thread(target=run_send, args=(self,), daemon=True).start()

    def start_zmq(self):
        def run_capture(self):

            if self.cam_source == "0":
                self.cam = cv2.VideoCapture(0)
            else:
                self.cam = cv2.VideoCapture(self.cam_source)
            cnt = 0
            while self.cam_is_alive:
                is_ok, img = self.cam.read()
                if is_ok:

                    width = IMG_WIDTH
                    ratio = IMG_WIDTH / img.shape[1]
                    height = int(img.shape[0] * ratio + 0.000001)
                    if height >= self.IMG_HEIGHT:
                        height = self.IMG_HEIGHT
                        ratio = self.IMG_HEIGHT / img.shape[0]
                        width = int(img.shape[1] * ratio + 0.000001)

                    img = cv2.resize(img, (width, height))
                    self.last_img = img
                    self.last_update = time.time()

                    time.sleep(1 / self.fps)
                else:
                    time.sleep(1)
                    self.restart_cam()
            logger.warning("Stream {} finished".format(self.cam_id))

        def run_send(self):
            cnt = 0
            while self.cam_is_alive:
                cnt += 1
                if self.last_img is None:
                    logger.warning(
                        "stream {} img not ready".format(self.cam_id))
                    time.sleep(1)
                    continue
                if self.last_send == self.last_update:
                    # logger.warning('no new img')
                    time.sleep(1 / self.fps)
                    continue
                if cnt % 30 == 1:
                    logger.warning(
                        "send through channel {} to inference server".format(
                            bytes(self.cam_id, "utf-8")
                        )
                    )
                # self.mutex.acquire()
                # FIXME may find a better way to deal with encoding
                self.zmq_sender.send_multipart(
                    [
                        bytes(self.cam_id, "utf-8"), self.last_img.tobytes(),
                    ]
                )
                self.last_send = self.last_update
                time.sleep(1 / self.fps)

        threading.Thread(target=run_capture, args=(self,), daemon=True).start()
        threading.Thread(target=run_send, args=(self,), daemon=True).start()

    def restart_cam(self):

        logger.warning("Restarting Cam {}".format(self.cam_id))

        cam = cv2.VideoCapture(self.cam_source)

        # Protected by Mutex
        self.mutex.acquire()
        self.cam.release()
        self.cam = cam
        self.mutex.release()

    def update_cam(self, cam_id, cam_source, endpoint):
        print("[INFO] Updating Cam ...", flush=True)

        # if self.cam_type == cam_type and self.cam_source == cam_source:
        #    return
        if (
            self.cam_source != cam_source
            or round(self.frameRate) != round(frameRate)
            or self.lva_mode != lva_mode
        ):
            self.cam_source = cam_source
            self.frameRate = frameRate
            self.lva_mode = lva_mode
            self._update_instance(normalize_rtsp(cam_source), str(frameRate))

        self.has_aoi = has_aoi
        self.aoi_info = aoi_info

        detection_mode = self.model.get_detection_mode()
        if detection_mode == "PC":
            print("[INFO] Line INFO", line_info, flush=True)
            self.scenario = PartCounter()
            self.scenario_type = self.model.detection_mode
            try:
                line_info = json.loads(line_info)
                self.use_line = line_info["useCountingLine"]
                lines = line_info["countingLines"]
                if len(lines) > 0:
                    x1 = int(lines[0]["label"][0]["x"])
                    y1 = int(lines[0]["label"][0]["y"])
                    x2 = int(lines[0]["label"][1]["x"])
                    y2 = int(lines[0]["label"][1]["y"])
                    self.scenario.set_line(x1, y1, x2, y2)
                    print("Upading Line:", flush=True)
                    print("    use_line:", self.use_line, flush=True)
                    print("        line:", x1, y1, x2, y2, flush=True)
                else:
                    print("Upading Line:", flush=True)
                    print("    use_line:", self.use_line, flush=True)

            except:
                self.use_line = False
                print("Upading Line[*]:", flush=True)
                print("    use_line   :", False, flush=True)

        elif detection_mode == "ES":
            print("[INFO] Zone INFO", zone_info, flush=True)
            self.scenario = DangerZone()
            self.scenario_type = self.model.detection_mode
            # FIXME
            self.scenario.set_targets(["person"])
            try:
                zone_info = json.loads(zone_info)
                self.use_zone = zone_info["useDangerZone"]
                zones = zone_info["dangerZones"]
                _zones = []
                print("Upading Line:", flush=True)
                print("    use_zone:", self.use_zone, flush=True)
                for zone in zones:
                    x1 = int(zone["label"]["x1"])
                    y1 = int(zone["label"]["y1"])
                    x2 = int(zone["label"]["x2"])
                    y2 = int(zone["label"]["y2"])
                    _zones.append([x1, y1, x2, y2])
                    print("     zone:", x1, y1, x2, y2, flush=True)
                self.scenario.set_zones(_zones)

            except:
                self.use_zone = False
                print("Upading Zone[*]:", flush=True)
                print("    use_zone   :", False, flush=True)

        elif detection_mode == "DD":
            print("[INFO] Line INFO", line_info, flush=True)
            self.scenario = DefeatDetection()
            self.scenario_type = self.model.detection_mode
            # FIXME
            self.scenario.set_ok("Bottle - OK")
            self.scenario.set_ng("Bottle - NG")
            try:
                line_info = json.loads(line_info)
                self.use_line = line_info["useCountingLine"]
                lines = line_info["countingLines"]
                if len(lines) > 0:
                    x1 = int(lines[0]["label"][0]["x"])
                    y1 = int(lines[0]["label"][0]["y"])
                    x2 = int(lines[0]["label"][1]["x"])
                    y2 = int(lines[0]["label"][1]["y"])
                    self.scenario.set_line(x1, y1, x2, y2)
                    print("Upading Line:", flush=True)
                    print("    use_line:", self.use_line, flush=True)
                    print("        line:", x1, y1, x2, y2, flush=True)
                else:
                    print("Upading Line:", flush=True)
                    print("    use_line:", self.use_line, flush=True)

            except:
                self.use_line = False
                print("Upading Line[*]:", flush=True)
                print("    use_line   :", False, flush=True)
        else:
            self.scenario = None
            self.scenario_type = self.model.detection_mode

    def check_update(self, rtsp, fps, endpoint):
        print(endpoint)
        print(type(endpoint))
        print(self.endpoint)
        print(type(self.endpoint))
        return rtsp != self.cam_source or endpoint != self.endpoint or self.fps != fps

    def delete(self):
        # self.mutex.acquire()
        self.cam_is_alive = False
        # self.mutex.release()

        logging.info("Deactivate stream {}".format(self.cam_id))
