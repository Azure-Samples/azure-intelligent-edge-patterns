"""App signals.
"""

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from ..cameras.models import Camera
from .models import CameraTask

logger = logging.getLogger(__name__)
