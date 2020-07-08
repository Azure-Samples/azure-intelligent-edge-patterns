"""
Azure IOT related function
"""
from azure.iot.device import IoTHubModuleClient
from azure.iot.hub import IoTHubRegistryManager

from configs.iot_config import IOT_HUB_CONNECTION_STRING


def get_iot():
    """get iot"""
    try:
        iot = IoTHubRegistryManager(IOT_HUB_CONNECTION_STRING)
    except:
        iot = None
    return iot


def is_edge():
    """is edge: bool"""
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except:
        return False


def inference_module_url():
    """inference module url"""
    if is_edge():
        return '172.18.0.1:5000'
    return 'localhost:5000'
