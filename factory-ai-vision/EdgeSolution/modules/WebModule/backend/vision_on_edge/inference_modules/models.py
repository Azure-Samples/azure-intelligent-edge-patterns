"""App models.
"""

import logging

import requests
from django.db import models

from ..azure_iot.utils import upload_module_url

logger = logging.getLogger(__name__)


class InferenceModule(models.Model):
    """InferenceModule Model."""

    name = models.CharField(max_length=200)
    url = models.CharField(max_length=1000, unique=True)

    def recommended_fps(self) -> float:
        try:
            response = requests.get(
                "http://" + self.url + "/get_recommended_total_fps", timeout=3
            )
            result = float(response.json()["fps"])
        except Exception:
            logger.exception(
                "Get recommended_fps from inference module failed. Fallback to default."
            )
            result = 10.0
        return result

    def device(self) -> bool:
        try:
            response = requests.get("http://" + self.url + "/get_device", timeout=1)
            result = response.json()["device"]
            return result
        except Exception:
            return "cpu"

    def is_vpu(self) -> bool:
        try:
            response = requests.get("http://" + self.url + "/get_device")
            result = response.json()["device"]
            return result == "vpu"
        except Exception:
            return False

    def upload_status(self) -> bool:
        try:
            response = requests.get("http://" + str(upload_module_url()) + "/status")
            result = response.json()
            return result == "ready"
        except Exception:
            return False

    def __str__(self):
        return self.name
