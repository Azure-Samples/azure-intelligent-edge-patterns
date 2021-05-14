import json
import logging
import os
import pathlib
import re
import ssl
import sys
import time
import threading
import urllib.request
from builtins import input
from os import path

import requests
from azure.iot.hub import IoTHubRegistryManager
from azure.iot.hub.models import CloudToDeviceMethod, CloudToDeviceMethodResult

from config import IOTHUB_CONNECTION_STRING
from utility import is_edge

DEVICE_ID = os.environ.get("IOTEDGE_DEVICEID", "local")
MODULE_ID = "lvaEdge"

default_payload = {"@apiVersion": "2.0"}
logger = logging.getLogger(__name__)

# Known issue from LVA
# https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/troubleshoot-how-to#multiple-direct-methods-in-parallel--timeout-failure
mutex = threading.Lock()


class GraphManager:
    def __init__(self):
        if is_edge():
            try:
                self.registry_manager = IoTHubRegistryManager(
                    IOTHUB_CONNECTION_STRING)
            except:
                logger.warning(
                    'IoTHub authentication failed. The server will terminate in 10 seconds.')
                time.sleep(10)
                sys.exit(-1)

        else:
            self.registry_manager = None
        self.device_id = DEVICE_ID
        self.module_id = MODULE_ID

    def invoke_method(self, method_name, payload):
        if not self.registry_manager:
            print(
                "[WARNING] Not int edge evironment, ignore direct message", flush=True
            )
        mutex.acquire()
        try:
            module_method = CloudToDeviceMethod(
                method_name=method_name, payload=payload, response_timeout_in_seconds=30
            )
            res = self.registry_manager.invoke_device_module_method(
                self.device_id, self.module_id, module_method
            )
            mutex.release()
            return res.as_dict()
        except:
            mutex.release()
            print("[ERROR] Failed to invoke direct method:",
                  sys.exc_info(), flush=True)
            return {"error": "failed to invoke direct method"}

    def invoke_graph_topology_get(self, name):
        method = "pipelineTopologyGet"
        payload = {
            "@apiVersion": "2.0",
            "name": name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_topology_set(self, name, properties):
        method = "pipelineTopologySet"
        payload = {
            "@apiVersion": "2.0",
            "name": name,
            "properties": properties,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_topology_list(self):
        method = "pipelineTopologyList"
        payload = {
            "@apiVersion": "2.0",
        }
        return self.invoke_method(method, payload)

    def invoke_graph_topology_delete(self, name):
        method = "pipelineTopologyDelete"
        payload = {
            "@apiVersion": "2.0",
            "name": name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_get(self, name):
        method = "livePipelineGet"
        payload = {
            "@apiVersion": "2.0",
            "name": name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_set(self, name, properties):
        method = "livePipelineSet"
        payload = {
            "@apiVersion": "2.0",
            "name": name,
            "properties": properties,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_delete(self, name):
        method = "livePipelineDelete"
        payload = {
            "@apiVersion": "2.0",
            "name": name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_list(self):
        method = "livePipelineList"
        payload = {
            "@apiVersion": "2.0",
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_activate(self, name):
        method = "livePipelineActivate"
        payload = {
            "@apiVersion": "2.0",
            "name": name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_deactivate(self, name):
        method = "livePipelineDeactivate"
        payload = {
            "@apiVersion": "2.0",
            "name": name,
        }
        return self.invoke_method(method, payload)

    # default grpc settings
    def invoke_graph_grpc_topology_set(self):
        method = "pipelineTopologySet"
        with open("grpc_topology.json") as f:
            payload = json.load(f)
        return self.invoke_method(method, payload)

    def invoke_graph_grpc_instance_set(self, name, rtspUrl, frameRate, recording_duration):
        recordingDuration = "PT{}S".format(recording_duration)
        find_cred, username, password = self.parse_rtsp_credential(rtspUrl)
        properties = {
            "topologyName": "InferencingWithGrpcExtension",
            "description": "Sample graph description",
            "parameters": [
                {"name": "rtspUrl", "value": rtspUrl},
                {"name": "rtspUserName", "value": username},
                {"name": "rtspPassword", "value": password},
                {"name": "frameRate", "value": frameRate},
                {"name": "instanceId", "value": name},
                {"name": "recordingDuration", "value": recordingDuration},
                {
                    "name": "grpcExtensionAddress",
                    "value": "tcp://inferencemodule:44000",
                },
                {"name": "frameHeight", "value": "540"},
                {"name": "frameWidth", "value": "960"},
            ],
        }
        return self.invoke_graph_instance_set(name, properties)

    # default http extension settings
    def invoke_graph_http_topology_set(self):
        method = "pipelineTopologySet"
        with open("http_topology.json") as f:
            payload = json.load(f)
        return self.invoke_method(method, payload)

    def invoke_graph_http_instance_set(self, name, rtspUrl, frameRate, recording_duration):
        inferencingUrl = "http://inferencemodule:5000/predict?camera_id=" + \
            str(name)
        recordingDuration = "PT{}S".format(recording_duration)
        find_cred, username, password = self.parse_rtsp_credential(rtspUrl)
        properties = {
            "topologyName": "InferencingWithHttpExtension",
            "description": "Sample graph description",
            "parameters": [
                {"name": "rtspUrl", "value": rtspUrl},
                {"name": "rtspUserName", "value": username},
                {"name": "rtspPassword", "value": password},
                {"name": "frameRate", "value": frameRate},
                {"name": "instanceId", "value": name},
                {"name": "recordingDuration", "value": recordingDuration},
                {"name": "inferencingUrl", "value": inferencingUrl},
                {"name": "frameHeight", "value": "540"},
                {"name": "frameWidth", "value": "960"},
            ],
        }
        return self.invoke_graph_instance_set(name, properties)

    def invoke_topology_set(self, mode):
        if mode == "grpc":
            return self.invoke_graph_grpc_topology_set()
        elif mode == "http":
            return self.invoke_graph_http_topology_set()
        else:
            return "LVA mode error"

    def invoke_instance_set(self, mode, name, rtspUrl, frameRate, recording_duration):
        if mode == "grpc":
            return self.invoke_graph_grpc_instance_set(name, rtspUrl, frameRate, recording_duration)
        elif mode == "http":
            return self.invoke_graph_http_instance_set(name, rtspUrl, frameRate, recording_duration)
        else:
            return "LVA mode error"

    def parse_rtsp_credential(self, rtspUrl):
        find_cred = False
        username = 'dummyuser'
        password = 'dummypassword'
        if '@' in rtspUrl:
            pattern = '\\:\\/\\/(?P<_0>.+)\\:(?P<_1>.+)\\@'
            out = re.findall(pattern, rtspUrl)
            if len(out) > 0:
                username = out[0][0]
                password = out[0][1]
                find_cred = True

        return(find_cred, username, password)


if is_edge():
    gm = GraphManager()
else:
    gm = None
