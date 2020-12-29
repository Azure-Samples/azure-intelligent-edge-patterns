from azure.iot.device import IoTHubModuleClient
import socket


def is_edge():
    """is_edge.
    """
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except Exception:
        return False


def get_inference_url():
    if is_edge():
        ip = socket.gethostbyname("inferencemodule")
        return "http://" + ip + ":5000"
        # return "http://InferenceModule:5000"
    else:
        return "http://localhost:5000"


INFERNENCE_URL = get_inference_url()
