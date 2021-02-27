import sys
import linecache
import json
from os import path
import argparse
import logging
import pathlib

from builtins import input

import ssl
import urllib.request

# Must install following packages
#   pip install azure-iot-device
#   pip install azure-iot-hub
from azure.iot.hub import IoTHubRegistryManager
from azure.iot.hub.models import CloudToDeviceMethod, CloudToDeviceMethodResult

def urlToText(url):
    url = url.replace(path.sep, '/')
    resp = urllib.request.urlopen(url, context=ssl._create_unverified_context())
    return resp.read()
    
class GraphManager:
    def __init__(self, ioThubConnectionString, deviceId, moduleId, operationsApiVersion):
        self._iotHubConnStr = ioThubConnectionString
        self._deviceId = deviceId
        self._moduleId = moduleId
        self._apiVersion = operationsApiVersion

        self._registryManager = IoTHubRegistryManager(self._iotHubConnStr)

    def InvokeModuleMethod(self, methodName, payload):
        moduleMethod = CloudToDeviceMethod(method_name=methodName, payload=payload)
        return self._registryManager.invoke_device_module_method(self._deviceId, self._moduleId, moduleMethod)

    def GraphTopologySet(self, opParams):
        if opParams is None:
            logging.info('Operation parameters missing')
            raise Exception

        if opParams.get('topologyUrl') is not None:
            topologyJsonString = urlToText(opParams['topologyUrl'])
        elif opParams.get('topologyFile') is not None:
            from sys import platform

            if platform == "win32": #Windows
                fpath = 'file:///' + path.join(pathlib.Path(__file__).parent.absolute(), opParams['topologyFile'])
            else: #Linux or MacOS
                fpath = 'file://' + path.join(pathlib.Path(__file__).parent.absolute(), opParams['topologyFile'])
              
            topologyJsonString = urlToText(fpath)
        else:
            logging.info('Neither topologyUrl nor topologyFile specified')

        topologyJson = json.loads(topologyJsonString)

        return self.InvokeModuleMethod('GraphTopologySet', topologyJson)

    def GenericCall(self, methodName, opParams):
        if opParams is None:
            logging.info('Operation parameters missing')
            raise Exception
        
        opParams['@apiVersion'] = self._apiVersion
        return self.InvokeModuleMethod(methodName, opParams)