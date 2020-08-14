"""App"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class AzureTrainingStatusConfig(AppConfig):
    """App Config

    Import signals and create demo objects.
    """

    name = 'vision_on_edge.azure_training_status'

    def ready(self):
        """
        Azure Training Status App Ready
        """
        if 'runserver' in sys.argv:
            # pylint: disable=unused-import, import-outside-toplevel
            from . import signals
