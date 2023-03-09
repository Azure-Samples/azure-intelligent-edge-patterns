import threading
import cv2
import numpy as np
import io
import onnxruntime
import json
import logging
import os
import linecache
import sys

logging.basicConfig(level=logging.DEBUG)

def PrintGetExceptionDetails():
    exType, exValue, exTraceback = sys.exc_info()

    tbFrame = exTraceback.tb_frame
    lineNo = exTraceback.tb_lineno
    fileName = tbFrame.f_code.co_filename

    linecache.checkcache(fileName)
    line = linecache.getline(fileName, lineNo, tbFrame.f_globals)

    exMessage = '[IS] Exception:\n\tFile name: {0}\n\tLine number: {1}\n\tLine: {2}\n\tValue: {3}'.format(fileName, lineNo, line.strip(), exValue)

    logging.info(exMessage)


class MLModel:
    def __init__(self):
        try:
            self._modelFileName = 'model.onnx'
            self._labelFileName = 'labels.txt'
            self._lock = threading.Lock()

            with open(self._labelFileName, "r") as f:
                self._labelList = [l.rstrip() for l in f]
            
            self._onnxSession = onnxruntime.InferenceSession(self._modelFileName)

        except:
            PrintGetExceptionDetails()

    def Preprocess(self, cvImage):
        try:
            imageBlob = cv2.cvtColor(cvImage, cv2.COLOR_BGR2RGB)
            imageBlob = np.array(imageBlob, dtype='float32')
            imageBlob /= 255.
            imageBlob = np.transpose(imageBlob, [2, 0, 1])
            imageBlob = np.expand_dims(imageBlob, 0)

            return imageBlob
        except:
            PrintGetExceptionDetails()

    def Postprocess(self, boxes, scores, indices):
        try:
            detectedObjects = []

            for idx in indices:
                idxTuple = (idx[0], idx[2])
                temp = [i for i in boxes[idxTuple]]  # temp[1, 0, 3, 2] = xmin, ymin, xmax, ymax
                dobj = {
                    "type" : "entity",
                    "entity" : {
                        "tag" : {
                            "value" : self._labelList[idx[1]],
                            "confidence" : str(scores[tuple(idx)])
                        },
                        "box" : {
                            "l" : str(temp[1] / 416),
                            "t" : str(temp[0] / 416),
                            "w" : str((temp[3] - temp[1]) / 416),
                            "h" : str((temp[2] - temp[0]) / 416)
                        }
                    }
                }
                detectedObjects.append(dobj)

            return detectedObjects
            
        except:
            PrintGetExceptionDetails()

    def Score(self, cvImage):
        try:
            with self._lock:
                imageBlob = self.Preprocess(cvImage)
                boxes, scores, indices = self._onnxSession.run(None, {"input_1": imageBlob, "image_shape":np.array([[416, 416]], dtype=np.float32)})
        
            return self.Postprocess(boxes, scores, indices)

        except:
            PrintGetExceptionDetails()

    def About(self):
        return str("<H1>ONNX Version: " + onnxruntime.__version__ + "</H1><BR><H1> App version: v 1.0</H1>")
