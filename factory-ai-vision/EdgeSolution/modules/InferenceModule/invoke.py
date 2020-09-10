import json
from os import path
import pathlib
import logging
from builtins import input
import requests
import ssl
import urllib.request
from azure.iot.hub import IoTHubRegistryManager
from azure.iot.hub.models import CloudToDeviceMethod, CloudToDeviceMethodResult

from config import IOTHUB_CONNECTION_STRING, DEVICE_ID

MODULE_ID = 'lvaEdge'

default_payload = {"@apiVersion": "1.0"}


class GraphManager:
    def __init__(self):
        self.registry_manager = IoTHubRegistryManager(IOTHUB_CONNECTION_STRING)
        self.device_id = DEVICE_ID
        self.module_id = MODULE_ID

    def invoke_method2(self, method_name, payload):

        body = {"methodName": method_name, "responseTimeoutInSeconds": 10,
                "connectTimeoutInSeconds": 10, "payload": payload}

        url = 'https://main.iothub.ext.azure.com/api/dataPlane/post'
        data = {"apiVersion": "2018-06-30", "authorizationPolicyKey": "rDav1fU61BRTezz8NewMe/UNasZob1rQ8FowPqrbD28=", "authorizationPolicyName": "service", "hostName": "customvision.azure-devices.net",
                "requestPath": "/twins/testcam/modules/lvaEdge/methods", "requestBody": str(body)}

        header = {
            "Authorization": IOTHUB_CONNECTION_STRING
        }
        res = requests.post(url, headers=header, data=data)
        return res.json()

    def invoke_method(self, method_name, payload):
        module_method = CloudToDeviceMethod(
            method_name=method_name, payload=payload, response_timeout_in_seconds=30)
        res = self.registry_manager.invoke_device_module_method(
            self.device_id, self.module_id, module_method)
        return res.as_dict()

    def invoke_graph_topology_get(self, name):
        method = 'GraphTopologyGet'
        payload = {
            "@apiVersion": "1.0",
            "name": name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_topology_set(self, name, properties):
        method = 'GraphTopologySet'
        payload = {
            "@apiVersion": "2.0",
            'name': name,
            'properties': properties,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_topology_list(self):
        method = 'GraphTopologyList'
        payload = {
            '@apiVersion': '1.0',
        }
        return self.invoke_method(method, payload)

    def invoke_graph_topology_delete(self, name):
        method = 'GraphTopologyDelete'
        payload = {
            '@apiVersion': '1.0',
            'name': name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_get(self, name):
        method = 'GraphInstanceGet'
        payload = {
            '@apiVersion': '1.0',
            'name': name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_set(self, name, properties):
        method = 'GraphInstanceSet'
        payload = {
            "@apiVersion": "1.0",
            'name': name,
            'properties': properties,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_delete(self, name):
        method = 'GraphInstanceDelete'
        payload = {
            '@apiVersion': '1.0',
            'name': name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_list(self):
        method = 'GraphInstanceList'
        payload = {
            '@apiVersion': '1.0',
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_activate(self, name):
        method = 'GraphInstanceActivate'
        payload = {
            '@apiVersion': '1.0',
            'name': name,
        }
        return self.invoke_method(method, payload)

    def invoke_graph_instance_deactivate(self, name):
        method = 'GraphInstanceDeactivate'
        payload = {
            '@apiVersion': '1.0',
            'name': name,
        }
        return self.invoke_method(method, payload)

    # default grpc settings
    def invoke_graph_grpc_topology_set(self):
        method = 'GraphTopologySet'
        with open('grpc_topology.json') as f:
            payload = json.load(f)
        return self.invoke_method(method, payload)

    def invoke_graph_grpc_instance_set(self, name, rtspUrl):
        properties = {
            "topologyName": "InferencingWithGrpcExtension",
            "description": "Sample graph description",
            "parameters": [
                {"name": "rtspUrl", "value": rtspUrl},
                {"name": "grpcExtensionAddress",
                    "value": "tcp://InferenceModule:44000"},
                {"name": "frameHeight", "value": "540"},
                {"name": "frameWidth", "value": "960"},
            ]
        }
        return self.invoke_graph_instance_set(name, properties)


gm = GraphManager()
