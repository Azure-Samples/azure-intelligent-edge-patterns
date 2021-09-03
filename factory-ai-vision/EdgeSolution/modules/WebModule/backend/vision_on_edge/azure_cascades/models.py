import logging
import requests

from django.db import models
from django.db.models.signals import post_save
from ..azure_iot.utils import model_manager_module_url

logger = logging.getLogger(__name__)

# Create your models here.
class Cascade(models.Model):
    name = models.CharField(max_length=200, null=True, blank=True, default="")
    flow = models.CharField(max_length=5000, null=True, blank=True, default="")
    raw_data = models.CharField(max_length=5000, null=True, blank=True, default="")
    prediction_uri = models.CharField(
        max_length=1000, null=True, blank=True, default=""
    )

    screenshot = models.CharField(max_length=1000000, null=True, blank=True, default="")

    def __repr__(self):
        return self.name.__repr__()

    def __str__(self):
        return self.name.__str__()

    def get_prediction_uri(self):
        """get_prediction_uri"""
        return self.prediction_uri

    @staticmethod
    def post_create(**kwargs):
        logger.warning("cascade post save: send config to model manager")
        instance = kwargs["instance"]

        url = "http://" + str(model_manager_module_url()) + "/set_voe_config"
        data = {"config": instance.flow}
        res = requests.post(url, json=data)
        logger.warning(res.text)
        # automatically add two edges: crop(coordinate, confidence)
        # edges = json.loads(instance.flow)["edges"]
        





post_save.connect(Cascade.post_create, Cascade, dispatch_uid="Cascade_post")

