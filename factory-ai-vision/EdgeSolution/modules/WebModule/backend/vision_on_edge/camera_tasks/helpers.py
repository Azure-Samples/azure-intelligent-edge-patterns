# App Helpers
# Helpers depends on models

import logging

from ..camera_tasks.models import CameraTask
from ..cameras.models import Camera

logger = logging.getLogger()


def create_tasks_at_startup():
    for cam in Camera.objects.all():
        CameraTask.objects.update_or_create(camera=cam)
