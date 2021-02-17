"""App.
"""

import sys

from django.apps import AppConfig


class CameraTaskConfig(AppConfig):
    """App Config."""

    name = "vision_on_edge.camera_tasks"

    def ready(self):
        """ready."""

        if "runserver" in sys.argv:
            # pylint: disable=unused-import, import-outside-toplevel
            from . import signals  # noqa: F401
            from .helpers import create_tasks_at_startup

            create_tasks_at_startup()
