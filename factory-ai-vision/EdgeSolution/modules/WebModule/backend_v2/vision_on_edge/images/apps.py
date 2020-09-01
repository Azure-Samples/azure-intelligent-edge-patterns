"""
Images App
"""
import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class ImagesConfig(AppConfig):
    """
    Azure Training App Config
    """
    name = 'vision_on_edge.images'

    def ready(self):
        """
        Images App Ready
        """
        # pylint: disable = unused-import, import-outside-toplevel
        from . import signals
