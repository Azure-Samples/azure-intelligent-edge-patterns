"""App utilities.
"""

import logging
import os
from typing import Union

from azure.iot.device import IoTHubModuleClient

logger = logging.getLogger(__name__)


def is_edge() -> bool:
    """Check if this app is running on edge.

    Returns:
        bool: is_edge
    """
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except Exception:
        IS_K8S = os.environ.get("IS_K8S", "false")
        if IS_K8S == "true":
            return True
        else:
            return False


def get_iothub_module_client(
    raise_exception: bool = False,
) -> Union[None, IoTHubModuleClient]:
    """Get iothub_module_client or return None

    Args:
        raise_exception (bool, optional):
            If True, error will raised.
            If false, will return None.
            Defaults to False.

    Returns:
        Union[None, IoTHubModuleClient]: IoTHubModuleClient instance or None
    """
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
    """Get InferenceModule Url.

    Returns:
        str: inference_module_url
    """

    if is_edge():
        # ip = socket.gethostbyname("InferenceModule")
        # return ip + ":5000"
        return "inferencemodule:5000"
    return "localhost:5000"


def upload_module_url() -> str:
    """Get UploadModule Url.

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


def yolo_module_url() -> str:
    """yolo_module_url.

    Returns:
        str: yolo_module_url
    """

    if is_edge():
        # ip = socket.gethostbyname("PredictModule")
        # return ip + ":7777/predict"
        return "yolov4module:80/score"
    return "localhost:7777/predict"


def model_manager_module_url() -> str:
    """Get ModelManagerModule Url.

    Returns:
        str: ModelManagerModule url
    """

    if is_edge():
        return "modelmanager:8585"
    return "localhost:8585"