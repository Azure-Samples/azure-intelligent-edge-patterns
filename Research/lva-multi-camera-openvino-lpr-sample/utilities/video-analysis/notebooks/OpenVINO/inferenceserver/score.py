
import sys
import linecache
import threading
from collections import OrderedDict
from openvino.inference_engine import IENetwork, IEPlugin
import timeit as t
import numpy as np
import logging
import json
import cv2
import os

logging.basicConfig(level=logging.DEBUG)

def PrintGetExceptionDetails():
    exType, exValue, exTraceback = sys.exc_info()

    tbFrame = exTraceback.tb_frame
    lineNo = exTraceback.tb_lineno
    fileName = tbFrame.f_code.co_filename

    linecache.checkcache(fileName)
    line = linecache.getline(fileName, lineNo, tbFrame.f_globals)

    exMessage = '[IS] Exception:\n\tFile name: {0}\n\tLine number: {1}\n\tLine: {2}\n\tValue: {3}'.format(
        fileName, lineNo, line.strip(), exValue)

    logging.info(exMessage)


class MLModel:

    # targetDev can take on the values of "CPU", "MYRIAD", "GPU", "FPGA"
    def __init__(self, modelName, modelPrecision, targetDev, pluginPath=None, cpuExtensions=None):
        try:
            self.initialized = False
            self.modelPath = "./models"
            self.modelName = modelName
            self.modelPrecision = modelPrecision
            self.targetDev = targetDev
            self.pluginPath = pluginPath
            self.cpuExtensions = cpuExtensions
            self._lock = threading.Lock()
            self.initEngine()

        except:
            PrintGetExceptionDetails()

    def initEngine(self):
        try:
            with self._lock:
                self.modelXMLFileName = os.path.join(
                    self.modelPath, self.modelName, self.modelPrecision, self.modelName + ".xml")
                self.modelBINFileName = os.path.join(
                    self.modelPath, self.modelName, self.modelPrecision, self.modelName + ".bin")

                # Initiate targetDev for hardware acceleration. Default is CPU acceleration
                self.iePlugin = IEPlugin(
                    device=self.targetDev, plugin_dirs=self.pluginPath)
                if self.cpuExtensions and 'CPU' in self.targetDev:
                    self.iePlugin.add_cpu_extension(self.cpuExtensions)

                ieNet = IENetwork(model=self.modelXMLFileName,
                                  weights=self.modelBINFileName)

                assert len(ieNet.inputs.keys()
                           ) == 1, "Only single input topologies supported!"
                assert len(
                    ieNet.outputs) == 1, "Only single output topologies supported!"
                self.inputBlob = next(iter(ieNet.inputs))
                self.outBlob = next(iter(ieNet.outputs))
                self.ieExecNet = self.iePlugin.load(
                    network=ieNet, num_requests=2)

                # Read and pre-process input image
                # n, c, h, w
                self.ieNetShape = ieNet.inputs[self.inputBlob].shape

        except:
            PrintGetExceptionDetails()

    def preprocess(self, cvImage):
        try:
            ih, iw = cvImage.shape[:-1]
            imageHW = (ih, iw)

            if (ih, iw) != (self.ieNetShape[2], self.ieNetShape[3]):
                cvImage = cv2.resize(
                    cvImage, (self.ieNetShape[3], self.ieNetShape[2]))

            # Change data layout from HWC to CHW
            cvImage = cvImage.transpose((2, 0, 1))
            cvImage = cvImage.reshape(self.ieNetShape)

            return cvImage
        except:
            PrintGetExceptionDetails()

    def postprocess(self, infRes):
        try:
            detectedObjects = []

            for obj in infRes[self.outBlob][0][0]:
               dobj = {
                   "type": "entity",
                   "entity": {
                       "tag": {
                           "value": str(obj[1]),
                           "confidence": str(obj[2])
                       },
                       "box": {
                           "l": str(obj[3]),
                           "t": str(obj[4]),
                           "w": str(obj[5]-obj[3]),
                           "h": str(obj[6]-obj[4])
                       }
                   }
               }
               detectedObjects.append(dobj)

            return detectedObjects

        except:
            PrintGetExceptionDetails()

    def score(self, cvImage):
        try:
            with self._lock:
                image = self.preprocess(cvImage)
                infRes = self.ieExecNet.infer(inputs={self.inputBlob: image})

            return self.postprocess(infRes)

        except:
            PrintGetExceptionDetails()

    def about(self):
        aboutString = "ModelName: {0}<br>ModelPrecision: {1}<br>TargetDev: {2}<br>PluginPath: {3}<br>CpuExtensions: {4}".format(
            self.modelName, self.modelPrecision, self.targetDev, self.pluginPath, self.cpuExtensions)
        return aboutString
