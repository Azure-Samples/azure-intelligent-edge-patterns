from azure.iot.device import IoTHubModuleClient


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
        return "http://InferenceModule:5000"
    else:
        return "http://localhost:5000"


INFERNENCE_URL = get_inference_url()
