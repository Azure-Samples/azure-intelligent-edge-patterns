"""
Location models
"""
from django.db import models


class Location(models.Model):
    """Location Model"""

    name = models.CharField(max_length=200)
    description = models.CharField(max_length=1000, blank=True, default="")
    is_demo = models.BooleanField(default=False)

    def __str__(self):
        return self.name
