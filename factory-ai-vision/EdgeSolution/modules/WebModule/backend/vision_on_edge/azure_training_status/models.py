"""App Models.

Include TrainingStatus.
"""

import logging

from django.db import models

from vision_on_edge.azure_training.models import Project

logger = logging.getLogger(__name__)

# Create your models here.


class TrainingStatus(models.Model):
    """Training Status Model
    """

    status = models.CharField(max_length=200)
    log = models.CharField(max_length=1000)
    performance = models.CharField(max_length=2000, default="{}")
    need_to_send_notification = models.BooleanField(default=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
