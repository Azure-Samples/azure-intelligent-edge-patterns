# -*- coding: utf-8 -*-
"""App models.
"""

import logging

from django.db import models

logger = logging.getLogger(__name__)


class InferenceModule(models.Model):
    """InferenceModule Model.
    """

    name = models.CharField(max_length=200)
    url = models.CharField(max_length=1000, unique=True)

    def __str__(self):
        return self.name
