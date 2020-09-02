# -*- coding: utf-8 -*-
"""App.
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class AzurePartDetectionConfig(AppConfig):
    """App Config.
    """

    name = 'vision_on_edge.azure_part_detections'

    def ready(self):
        """ready.
        """

        if 'runserver' in sys.argv:
            # pylint: disable=unused-import, import-outside-toplevel
            logger.info("ready while running server")
            logger.info("Importing Signals")
            from . import signals
            from ..azure_projects.models import Project
            from ..azure_part_detections.models import PartDetection
            from ..cameras.models import Camera
            from ..inference_modules.models import InferenceModule
            # pylint: enable=unused-import, import-outside-toplevel
            create_demo = True
            if create_demo:
                project_obj = Project.objects.filter(is_demo=False).first()
                inference_obj = InferenceModule.objects.first()
            else:
                project_obj = inference_obj = None
            if not PartDetection.objects.all().exists():
                PartDetection.objects.create(
                    project=project_obj,
                    inference_module=inference_obj,
                )
