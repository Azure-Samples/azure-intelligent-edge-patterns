import json
import logging
import os
import pathlib
import ssl
import sys
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

default_payload = {"@apiVersion": "1.0"}

# Known issue from LVA
# https://docs.microsoft.com/en-us/azure/media-services/live-video-analytics-edge/troubleshoot-how-to#multiple-direct-methods-in-parallel--timeout-failure
mutex = threading.Lock()


class GraphManager:
    def __init__(self):
        if is_edge:
            self.registry_manager = IoTHubRegistryManager(IOTHUB_CONNECTION_STRING)
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
            print("[ERROR] Failed to invoke direct method:", sys.exc_info(), flush=True)
            return {"error": "failed to invoke direct method"}

    def invoke_graph_topology_get(self, name):
        method = "GraphTopologyGet"
        payload = {
            "@apiVersion": "1.0",
            "name": name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_topology_set(self, name, properties):
        method = "GraphTopologySet"
        payload = {
            "@apiVersion": "1.0",
            "name": name,
            "properties": properties,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_topology_list(self):
        method = "GraphTopologyList"
        payload = {
            "@apiVersion": "1.0",
        }
        return self.invoke_method(method, payload)

    def invoke_graph_topology_delete(self, name):
        method = "GraphTopologyDelete"
        payload = {
            "@apiVersion": "1.0",
            "name": name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_get(self, name):
        method = "GraphInstanceGet"
        payload = {
            "@apiVersion": "1.0",
            "name": name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_set(self, name, properties):
        method = "GraphInstanceSet"
        payload = {
            "@apiVersion": "1.0",
            "name": name,
            "properties": properties,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_delete(self, name):
        method = "GraphInstanceDelete"
        payload = {
            "@apiVersion": "1.0",
            "name": name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_list(self):
        method = "GraphInstanceList"
        payload = {
            "@apiVersion": "1.0",
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_activate(self, name):
        method = "GraphInstanceActivate"
        payload = {
            "@apiVersion": "1.0",
            "name": name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_deactivate(self, name):
        method = "GraphInstanceDeactivate"
        payload = {
            "@apiVersion": "1.0",
            "name": name,
        }
        return self.invoke_method(method, payload)

    # default grpc settings
    def invoke_graph_grpc_topology_set(self):
        method = "GraphTopologySet"
        with open("grpc_topology.json") as f:
            payload = json.load(f)
        return self.invoke_method(method, payload)

    def invoke_graph_grpc_instance_set(self, name, rtspUrl, frameRate):
        properties = {
            "topologyName": "InferencingWithGrpcExtension",
            "description": "Sample graph description",
            "parameters": [
                {"name": "rtspUrl", "value": rtspUrl},
                {"name": "frameRate", "value": frameRate},
                {
                    "name": "grpcExtensionAddress",
                    "value": "tcp://InferenceModule:44000",
                },
                {"name": "frameHeight", "value": "540"},
                {"name": "frameWidth", "value": "960"},
            ],
        }
        return self.invoke_graph_instance_set(name, properties)

    # default http extension settings
    def invoke_graph_http_topology_set(self):
        method = "GraphTopologySet"
        with open("http_topology.json") as f:
            payload = json.load(f)
        return self.invoke_method(method, payload)

    def invoke_graph_http_instance_set(self, name, rtspUrl, frameRate):
        inferencingUrl = "http://InferenceModule:5000/predict?camera_id=" + str(name)
        properties = {
            "topologyName": "InferencingWithHttpExtension",
            "description": "Sample graph description",
            "parameters": [
                {"name": "rtspUrl", "value": rtspUrl},
                {"name": "frameRate", "value": frameRate},
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

    def invoke_instance_set(self, mode, name, rtspUrl, frameRate):
        if mode == "grpc":
            return self.invoke_graph_grpc_instance_set(name, rtspUrl, frameRate)
        elif mode == "http":
            return self.invoke_graph_http_instance_set(name, rtspUrl, frameRate)
        else:
            return "LVA mode error"


gm = GraphManager()
