
import torch
from PIL import Image
import numpy as np
import timeit as t
import datetime
import io
import os
import uuid
import json
import logging
import threading
from collections import OrderedDict
import cv2
import copy
from dotenv import load_dotenv

from collections import MutableMapping
from collections import defaultdict
from contextlib import suppress

# from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient

from lpdet.apis import det_and_recognize
from lpdet.utils import Config, load_checkpoint, ProgressBar
from lpdet.models import build_detector, build_recognizer

logging.basicConfig(level=logging.DEBUG)
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

class AnalyticsAPI:
    INF_STAT_OK = 0             # OK
    INF_STAT_NOT_READY = 1      # Scoring engine is not ready
    INF_STAT_EXCEPTION = 2      # Exception occured whiled inferencing

    def __init__(self, 
                 detModelFileName="models/detector.pth",
                 recModelFileName="models/recognizer.pth",
                 detCfgFileName="configs/detector.py",
                 recCfgFileName="configs/recognizer.py",
                 workDir = ".",
                 probThreshold=0.5):
        try:
            self.initialized = False
            self.detModelFileName = os.path.join(workDir, detModelFileName)
            self.recModelFileName = os.path.join(workDir, recModelFileName)
            self.detCfgFileName = os.path.join(workDir, detCfgFileName)
            self.recCfgFileName = os.path.join(workDir, recCfgFileName)
            self.det_cfg = Config.fromfile(self.detCfgFileName)
            self.rec_cfg = Config.fromfile(self.recCfgFileName)
            self.workDir = workDir
            self.probThreshold = probThreshold
            self.volume = "/var/media/" # where images write out to in container
            self.logID = "AnalyticsAPILogger"

            # Keep track of plates, coming and going of car
            self.cache = AnalyticsCache()
            
            # Load local .env file
            load_dotenv()
            
            #self.storageConnStr = os.getenv("storageConnStr", "")
            #self.containerName = 'alprlva'
            # this is used to visualize
            #self.blob_service_client = BlobServiceClient(account_url=self.storageConnStr) 
            
            self.logger = logging.getLogger(self.logID)
            self._lock = threading.Lock()
            
            self.initEngine()
                    
        except Exception as e:
            self.logger.info("[AI EXT] Exception (AnalyticsAPI/__init__): {0}".format(str(e)))
            return None

    def initEngine(self):
        try:
            with self._lock:
                self.initialized = False
                self.logger.info("[AI EXT] AnalyticsAPI init start.")

                start = t.default_timer()
                
                # Build network and load model                
                self.detector = build_detector(self.det_cfg.model, test_cfg=self.det_cfg.test_cfg)
                load_checkpoint(self.detector, self.detModelFileName)
                self.detector.eval()
                self.detector.to(device)

                self.recognizer = build_recognizer(self.rec_cfg.model, test_cfg=self.rec_cfg.test_cfg)
                load_checkpoint(self.recognizer, self.recModelFileName)
                self.recognizer.eval()
                self.recognizer.to(device)
                
                end = t.default_timer()

                self.initialized = True

                self.logger.info("[AI EXT] AnalyticsAPI init time: {0} ms".format(round((end - start) * 1000, 2)))

                # For saving to file
                self.filename = ""
                # self.blobfolder = ""

        except Exception as e:
            self.logger.info("[AI EXT] Exception (ScoringAPI/initModel): {0}".format(str(e)))
            return None

    def setProbabilityThreshold(self, probThreshold=0.5):
        self.probThreshold = probThreshold
        self.logger.info("[AI EXT] (setProbabilityThreshold): {0}".format(probThreshold))

    def getProbabilityThreshold(self):
        return self.probThreshold

    def postprocess(self, boxes, scores, plates):
        resDict = OrderedDict()


        line_pairs = [(0, 1, 2, 3),
                        (2, 3, 4, 5),
                        (4, 5, 6, 7),
                        (6, 7, 0, 1)]

        objectId = 0
        numObjectsIdentified = len(boxes)
        if numObjectsIdentified > 0:
            for i in range(len(boxes)):
                if scores[i] > self.probThreshold:
                    # The box is length 8 array representing a square (4 points)
                    # [0,1] is xmin, ymin
                    # [4,5] is xmax, ymax
                    box = boxes[i]

                    r = np.round(box).astype(int)

                    xmin = int(box[0])
                    ymin = int(box[1])
                    xmax = int(box[4])
                    ymax = int(box[5])

                    resDict[objectId] = {   "plate": plates[i], 
                                            "confidence": round(float(scores[i])), 
                                            "xmin": xmin, 
                                            "ymin": ymin, 
                                            "xmax": xmax, 
                                            "ymax": ymax}
                    objectId += 1

        return resDict
    
    def visualize_result(self, img, reslist):

        img = img.copy()

        line_pairs = [(0, 1, 2, 3),
                      (2, 3, 4, 5),
                      (4, 5, 6, 7),
                      (6, 7, 0, 1)]

        for res in reslist:
            r = np.round(res['corners']).astype(int)
            for lp in line_pairs:
                cv2.line(img, (r[lp[0]], r[lp[1]]), (r[lp[2]], r[lp[3]]), (0, 255, 0), thickness=2)
            x1, y1 = np.min(r[0:8:2]), np.min(r[1:8:2])
            cv2.putText(img, res['string'], (x1, y1-20), cv2.FONT_HERSHEY_COMPLEX, 1, (0, 255, 0), thickness=2)

        return img

    def score(self, pilImage):
        try:
            with self._lock:
                if self.initialized:
                    
                    start = t.default_timer()
                    imgData = np.asarray(pilImage)
                    # RGB to BGR (numpy to opencv)
                    imgData = imgData[:, :, ::-1]
                    imgSize = np.array([pilImage.size[1], pilImage.size[0]], dtype=np.float32).reshape(1, 2)
                
                    now = datetime.datetime.now()

                    reslist = det_and_recognize(self.detector, 
                                               self.recognizer, 
                                               imgData, 
                                               det_score_thresh=0.7, 
                                               det_img_scale=(480, 360), 
                                               device=device)
                    boxes = []
                    scores = []
                    plates = []
                    for res in reslist:
                        boxes.append(res['corners'])
                        scores.append(res['score'])
                        plates.append(res['string'])
                    
                    end = t.default_timer()
                    infTime = round((end - start) * 1000, 2)

                    resDict = self.postprocess(boxes,
                                               scores,
                                               plates)

                    for i in range(len(resDict)):
                        # Checking my cache - ASSUMPTION is only one plate at a time (TODO: take most conf plate if more than 1)
                        try:
                            plateAlreadyInCache = (resDict[i]["plate"] in self.cache.arrivedCache)
                            xmin = resDict[i]["xmin"]
                            ymin = resDict[i]["ymin"]
                            xmax = resDict[i]["xmax"]
                            ymax = resDict[i]["ymax"]
                            state = self.cache.checkCache(resDict[i]["plate"], (xmax-xmin), (ymax-ymin))

                        except Exception as e:
                            self.logger.info("[AI EXT] Exception warning (ScoringAPI - Score): {0}".format(str(e)))
                            state = "no_detection"
                        resDict[i]["vehicle_state"] = state

                        if state == "arrived" and not plateAlreadyInCache:
                            # Update blobfolder and filename
                            today = datetime.date.today()
                           # self.blobfolder = today.strftime("%Y-%m-%d")
                            self.filename = str(now).replace(' ','_').replace(':','-')+'.jpg'
                            # Save images on first detection
                            imgMarked = self.visualize_result(imgData, reslist)


                            height, width = imgMarked.shape[:2]
                            maxDim = max(height, width)
                            scale = 400/maxDim # 200 pixels max side size
                            imgThumb = cv2.resize(imgMarked, (int(scale*width), int(scale*height)),
                                                  interpolation=cv2.INTER_AREA)
                            # Write locally
                            cv2.imwrite(os.path.join(self.volume, self.filename), 
                                        imgThumb)
                            
                            # To upload to Blob. need container connection string
                          #  blob_client = self.blob_service_client.get_blob_client(container=self.containerName, 
                                                                           # blob=self.blobfolder+'/'+self.filename)
                            # Upload the local image file to Blob Storage
                          #  with open(os.path.join(self.volume, self.filename), "rb") as data:
                          #      blob_client.upload_blob(data)


                    result = {  "app_status": self.INF_STAT_OK, # want it to be 0
                                "time_for_inference_ms" : infTime,
                                "object_count" : len(resDict),
                                "result": resDict
                            }

                    result = json.dumps(result)
                else:
                    resJson = OrderedDict()
                    resJson[0] = {"status": self.INF_STAT_NOT_READY}
                    result = json.dumps(resJson)

            return result

        except Exception as e:
            self.logger.info("[AI EXT] Exception (ScoringAPI - Score): {0}".format(str(e)))
            resJson = OrderedDict()
            resJson[0] = {"status": self.INF_STAT_EXCEPTION}
            result = json.dumps(resJson)
            return result
        
    def version(self):
        return str("torch ", torch.__version__ + " - project v1.0")

    def about(self):
        aboutString = "Engine initialized: {0}<br>ProbThreshold: {1}".format(self.initialized, self.probThreshold)
        return aboutString

class AnalyticsCache:

    def __init__(self):
        self.arrivedCache = defaultdict()
        self.notCloseCache = defaultdict()
        self.trackingCache = defaultdict()
        self.threshold = 10e2 # based on Micheleen's driveway and cars. Hard coded value. Changed based on #country

    def checkCache(self, plate, width, height):
        """Update and check cache"""
        boxarea = width*height
        # Arrived = plate is big enough, over threshold
        if boxarea >= self.threshold:
            with suppress(KeyError):
                del self.notCloseCache[plate]
            self.arrivedCache[plate] = boxarea
        else:
            with suppress(KeyError):
                del self.arrivedCache[plate]
            self.notCloseCache[plate] = boxarea
        
        # Keep record of all plates and area of plate (even mislabeled ones)
        self.trackingCache[plate] = boxarea

        if plate in self.arrivedCache:
            return "arrived"
        elif plate in self.notCloseCache:
            return "not_arrived"
        else:
            return "other"








