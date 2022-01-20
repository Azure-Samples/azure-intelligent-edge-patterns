"""App.
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class AzureProjectsConfig(AppConfig):
    """App Config."""

    name = "vision_on_edge.azure_projects"

    def ready(self):
        """ready."""
        if "runserver" in sys.argv:
            # pylint: disable=unused-import, import-outside-toplevel
            from configs.general_configs import get_create_demo

            from . import signals  # noqa: F401
            from .helpers import create_default_objects, create_demo_objects

            create_default_objects()
            if get_create_demo():
                create_demo_objects()
