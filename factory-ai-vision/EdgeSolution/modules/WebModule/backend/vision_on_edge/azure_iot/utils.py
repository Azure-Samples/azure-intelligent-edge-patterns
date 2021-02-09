"""App utilities.
"""

import logging
import socket

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


def get_iothub_module_client(raise_exception=False):
    try:
        iot = IoTHubModuleClient.create_from_edge_environment()
        return iot
    except KeyError as key_error:
        logger.error(key_error)
    except OSError as os_error:
        logger.error(os_error)
    except Exception:
        logger.exception("Unexpected error")
    return None


def inference_module_url() -> str:
    """inference_module_url.

    Returns:
        str: inference_module_url
    """

    if is_edge():
        # ip = socket.gethostbyname("InferenceModule")
        # return ip + ":5000"
        return "inferencemodule:5000"
    return "localhost:5000"


def upload_module_url() -> str:
    """inference_module_url.

    Returns:
        str: inference_module_url
    """

    if is_edge():
        # ip = socket.gethostbyname("uploadmodule")
        # return ip + ":7000"
        return "uploadmodule:7000"
    return "localhost:7000"


def prediction_module_url() -> str:
    """inference_module_url.

    Returns:
        str: inference_module_url
    """

    if is_edge():
        # ip = socket.gethostbyname("PredictModule")
        # return ip + ":7777/predict"
        return "predictmodule:7777/predict"
    return "localhost:7777/predict"
