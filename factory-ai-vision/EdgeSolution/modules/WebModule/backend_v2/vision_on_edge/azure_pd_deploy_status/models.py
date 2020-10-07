"""App models.
"""

import logging

from django.db import models

from ..azure_part_detections.models import PartDetection

logger = logging.getLogger(__name__)

# Create your models here.


class DeployStatus(models.Model):
    """Training Status Model"""

    status = models.CharField(max_length=200)
    log = models.CharField(max_length=1000)
    need_to_send_notification = models.BooleanField(default=False)
    part_detection = models.OneToOneField(PartDetection, on_delete=models.CASCADE)
