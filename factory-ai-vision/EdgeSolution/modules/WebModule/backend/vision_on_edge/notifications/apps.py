"""App.
"""

import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)


# pylint: disable=unused-import
class NotificationsConfig(AppConfig):
    """Notifications App Config"""

    name = "vision_on_edge.notifications"

    def ready(self):
        """ready."""
        from . import signals  # noqa: F401
