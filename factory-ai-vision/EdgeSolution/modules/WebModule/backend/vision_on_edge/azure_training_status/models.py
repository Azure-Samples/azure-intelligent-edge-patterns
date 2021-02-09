"""App models.
"""

import logging

from django.db import models

from ..azure_projects.models import Project

logger = logging.getLogger(__name__)

# Create your models here.


class TrainingStatus(models.Model):
    """Training Status Model"""

    status = models.CharField(max_length=200, blank=True, default="ok")
    log = models.CharField(
        max_length=1000, blank=True, default="Status : Has not configured"
    )
    performance = models.CharField(max_length=2000, default="{}")
    need_to_send_notification = models.BooleanField(default=False)
    project = models.OneToOneField(Project, on_delete=models.CASCADE)

    def reset(self):
        """reset."""
        self.status = "ok"
        self.log = "Status : Has not configured"
        self.performance = "{}"

    def __repr__(self):
        res = {
            "project": str(self.project),
            "status": str(self.status),
            "log": str(self.log),
        }
        return str(res)

    def __str__(self):
        res = {
            "project": self.project.__repr__(),
            "status": self.status.__repr__(),
            "log": self.log.__repr__(),
        }
        return res.__repr__()
