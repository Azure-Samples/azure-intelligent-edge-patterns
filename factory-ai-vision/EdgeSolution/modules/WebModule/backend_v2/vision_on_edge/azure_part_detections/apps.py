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
            from ..azure_part_detections.models import PartDetection, PDScenario
            from ..cameras.models import Camera
            from ..inference_modules.models import InferenceModule
            # pylint: enable=unused-import, import-outside-toplevel
            create_demo = True
            if create_demo:
                project_obj = Project.objects.filter(is_demo=False).first()
                inference_obj = InferenceModule.objects.first()
            else:
                project_obj = inference_obj = None
            if PartDetection.objects.count() == 0:
                PartDetection.objects.create(name="Part Detection",
                                             project=project_obj,
                                             inference_module=inference_obj)
            PDScenario.objects.all().delete()
            # =============================================
            # Simple Part Detection                     ===
            # =============================================
            pd_scenario = PDScenario.objects.create(
                name="Simple Part Detection",
                inference_mode="PD",
                project=Project.objects.get(
                    name="Demo Part Detection Project"))
            pd_scenario.parts.set(
                Project.objects.get(
                    is_demo=True,
                    name="Demo Part Detection Project").part_set.all())
            # =============================================
            # Part Counting                             ===
            # =============================================
            pc_scenario = PDScenario.objects.create(
                name="Counting objects",
                inference_mode="PC",
                project=Project.objects.get(name="Demo Part Counting Project"),
            )
            pc_scenario.parts.set(
                Project.objects.get(
                    is_demo=True,
                    name="Demo Part Counting Project").part_set.all())
            # =============================================
            # Employee safety                           ===
            # =============================================
            pc_scenario = PDScenario.objects.create(
                name="Employee safety",
                inference_mode="ES",
                project=Project.objects.get(
                    name="Demo Employee Safety Project"),
            )
            pc_scenario.parts.set(
                Project.objects.get(
                    is_demo=True,
                    name="Demo Employee Safety Project").part_set.all())
            # =============================================
            # Defect Detection                          ===
            # =============================================
            pc_scenario = PDScenario.objects.create(
                name="Defect detection",
                inference_mode="DD",
                project=Project.objects.get(
                    name="Demo Defect Detection Project"),
            )
            pc_scenario.parts.set(
                Project.objects.get(
                    is_demo=True,
                    name="Demo Defect Detection Project").part_set.all())
