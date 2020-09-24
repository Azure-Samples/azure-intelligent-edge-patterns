"""App models.
"""

import logging

from django.db import models
from django.db.models.signals import pre_save

from vision_on_edge.azure_projects.models import Project

logger = logging.getLogger(__name__)


class Part(models.Model):
    """Part Model"""

    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=1000, blank=True, default="")
    name_lower = models.CharField(max_length=200, default=str(name).lower())
    customvision_id = models.CharField(max_length=200, blank=True, default="")
    customvision_type = models.CharField(max_length=20, blank=True, default="Regular")

    class Meta:
        unique_together = ("name_lower", "project")

    def __str__(self):
        return self.name

    @staticmethod
    def pre_save(**kwargs):
        """pre_save."""
        instance = kwargs["instance"]
        instance.name_lower = str(instance.name).lower()


pre_save.connect(Part.pre_save, Part, dispatch_uid="Part_pre")
