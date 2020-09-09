import json
from os import path
import pathlib
import logging
from builtins import input
import ssl
import urllib.request
from azure.iot.hub import IoTHubRegistryManager
from azure.iot.hub.models import CloudToDeviceMethod, CloudToDeviceMethodResult


default_payload = {"@apiVersion": "1.0"}


class GraphManager:
    def __init__(self):
        self.conn = 'HostName=customvision.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=1If/+cNQswsLkTKejbjWQZMpBt2q96x/z3vapuB3Ew0='
        self.registry_manager = IoTHubRegistryManager(self.conn)
        self.device_id = 'testcam'
        self.module_id = 'lvaEdge'

    def invoke_method(self, method_name, payload):
        module_method = CloudToDeviceMethod(
            method_name=method_name, payload=payload, response_timeout_in_seconds=30)
        res = self.registry_manager.invoke_device_module_method(
            self.device_id, self.module_id, module_method)
        return res.as_dict()
