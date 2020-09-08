# -*- coding: utf-8 -*-
"""App utilities.
"""

import logging

from azure.iot.device import IoTHubModuleClient

logger = logging.getLogger(__name__)


def is_edge() -> bool:
    """is_edge.

    Returns:
        bool: is_edge
    """
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except:
        return False


def inference_module_url() -> str:
    """inference_module_url.

    Returns:
        str: inference_module_url
    """

    if is_edge():
        return "172.18.0.1:5000"
    return "localhost:5000"
