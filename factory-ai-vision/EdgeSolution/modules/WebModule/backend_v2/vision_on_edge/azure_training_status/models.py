"""App Models.

Include TrainingStatus.
"""

import logging
import uuid as uuid_lib

from django.db import models

from vision_on_edge.azure_projects.models import Project

logger = logging.getLogger(__name__)

# Create your models here.


class TrainingStatus(models.Model):
    """Training Status Model
    """

    uuid = models.UUIDField(  # Used by the API to look up the record
        db_index=True,
        default=uuid_lib.uuid4,
        editable=False,
        unique=True)
    status = models.CharField(max_length=200)
    log = models.CharField(max_length=1000)
    performance = models.CharField(max_length=2000, default="{}")
    need_to_send_notification = models.BooleanField(default=False)
    project = models.OneToOneField(Project, on_delete=models.CASCADE,  to_field='uuid')
