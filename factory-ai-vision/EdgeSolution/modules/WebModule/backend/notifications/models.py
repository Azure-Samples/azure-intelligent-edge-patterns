"""
Notification model
"""
from django.db import models


class Notification(models.Model):
    """Notification Model"""

    title = models.CharField(max_length=200)
    details = models.CharField(max_length=1000, blank=True, default="")

    def __str__(self):
        return self.title
