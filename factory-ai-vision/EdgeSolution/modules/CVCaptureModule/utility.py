from azure.iot.device import IoTHubModuleClient
import socket
import os


def is_edge():
    """is_edge.
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


def get_inference_url():
    if is_edge():
        ip = socket.gethostbyname("inferencemodule")
        return "http://" + ip + ":5000"
        # return "http://InferenceModule:5000"
    else:
        return "http://localhost:5000"


INFERNENCE_URL = get_inference_url()
