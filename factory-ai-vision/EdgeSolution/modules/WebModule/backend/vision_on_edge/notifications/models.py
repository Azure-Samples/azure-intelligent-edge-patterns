# -*- coding: utf-8 -*-
"""Notification model
"""

import logging

from django.db import models

logger = logging.getLogger(__name__)

NOTIFICATION_TYPES = ['project']
NOTIFICATION_TYPE_CHOICES = [(i, i) for i in NOTIFICATION_TYPES]


class Notification(models.Model):
    """Notification Model
    """

    notification_type = models.CharField(max_length=20,
                                         choices=NOTIFICATION_TYPE_CHOICES,
                                         default=NOTIFICATION_TYPES[0])
    sender = models.CharField(max_length=200, default="system")
    timestamp = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=200)
    details = models.CharField(max_length=1000, blank=True, default="")

    def __str__(self):
        return " ".join([
            str(self.timestamp), self.notification_type, self.title,
            self.details
        ])
