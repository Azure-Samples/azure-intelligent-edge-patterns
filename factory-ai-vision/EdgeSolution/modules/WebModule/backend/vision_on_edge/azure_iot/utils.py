"""Utilities

Azure IoT Edge utilities.

functions:
    is_edge: depends is edge or not
    inference_module_url: get inference_module_url
"""

import logging

from azure.iot.device import IoTHubModuleClient

logger = logging.getLogger(__name__)


def is_edge() -> bool:
    """is_edge.

    Args:

    Returns:
        is_edge -> bool
    """
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except:
        return False


def inference_module_url() -> str:
    """inference_module_url.

    Args:

    Returns:
        str: inference_module_url
    """

    if is_edge():
        return "172.18.0.1:5000"
    return "localhost:5000"
