"""App.
"""

import logging
import sys

from django.apps import AppConfig

from configs.part_detection import DF_PD_VIDEO_SOURCE_IS_OPENCV

logger = logging.getLogger(__name__)


class AzurePartDetectionConfig(AppConfig):
    """App Config."""

    name = "vision_on_edge.azure_part_detections"

    def ready(self):
        """ready."""

        if "runserver" in sys.argv:
            # pylint: disable=unused-import, import-outside-toplevel
            logger.info("ready while running server")
            logger.info("Importing Signals")
            from ..azure_part_detections.models import PartDetection, PDScenario
            from ..azure_projects.models import Project
            from ..cameras.models import Camera
            from ..inference_modules.models import InferenceModule
            from . import signals  # noqa: F401

            # pylint: enable=unused-import, import-outside-toplevel

            create_demo = True
            if create_demo:
                project_obj = Project.objects.filter(is_demo=False).first()
                inference_obj = InferenceModule.objects.first()
            else:
                project_obj = inference_obj = None
            if PartDetection.objects.count() == 0:
                PartDetection.objects.create(
                    name="Part Detection",
                    project=project_obj,
                    inference_module=inference_obj,
                    inference_source=(
                        "opencv" if DF_PD_VIDEO_SOURCE_IS_OPENCV else "lva"
                    ),
                )
            PDScenario.objects.all().delete()
            # =============================================
            # Simple Part Detection                     ===
            # =============================================
            pd_scenario = PDScenario.objects.create(
                name="Simple Part Detection",
                inference_mode="PD",
                project=Project.objects.get(name="Demo Part Detection Project"),
            )
            pd_scenario.parts.set(
                Project.objects.get(
                    is_demo=True, name="Demo Part Detection Project"
                ).part_set.all()
            )
            # =============================================
            # Part Counting                             ===
            # =============================================
            pc_scenario = PDScenario.objects.create(
                name="Counting objects",
                inference_mode="PC",
                project=Project.objects.get(name="Demo Part Counting Project"),
            )
            pc_scenario.cameras.set(
                Camera.objects.filter(
                    is_demo=True, name="Scenario 1 - Counting Objects"
                )
            )
            pc_scenario.parts.set(
                Project.objects.get(
                    is_demo=True, name="Demo Part Counting Project"
                ).part_set.all()
            )
            # =============================================
            # Employee safety                           ===
            # =============================================
            es_scenario = PDScenario.objects.create(
                name="Employee safety",
                inference_mode="ES",
                project=Project.objects.get(name="Demo Employee Safety Project"),
            )
            es_scenario.cameras.set(
                Camera.objects.filter(is_demo=True, name="Scenario 2 - Employ Safety")
            )
            es_scenario.parts.set(
                Project.objects.get(
                    is_demo=True, name="Demo Employee Safety Project"
                ).part_set.all()
            )
            # =============================================
            # Defect Detection                          ===
            # =============================================
            dd_scenario = PDScenario.objects.create(
                name="Defect detection",
                inference_mode="DD",
                project=Project.objects.get(name="Demo Defect Detection Project"),
            )
            dd_scenario.cameras.set(
                Camera.objects.filter(
                    is_demo=True, name="Scenario 3 - Defect Detection"
                )
            )
            dd_scenario.parts.set(
                Project.objects.get(
                    is_demo=True, name="Demo Defect Detection Project"
                ).part_set.all()
            )
            # =============================================
            # Empty Shelf Alert                         ===
            # =============================================
            esa_scenario = PDScenario.objects.create(
                name="Empty shelf alert",
                inference_mode="ESA",
                project=Project.objects.get(name="Demo Empty Shelf Alert Project"),
            )
            esa_scenario.cameras.set(
                Camera.objects.filter(
                    is_demo=True, name="Scenario 4 - Empty Shelf Alert"
                )
            )
            esa_scenario.parts.set(
                Project.objects.get(
                    is_demo=True, name="Demo Empty Shelf Alert Project"
                ).part_set.all()
            )
            # =============================================
            # Total Customer Counting                   ===
            # =============================================
            tcc_scenario = PDScenario.objects.create(
                name="People counting",
                inference_mode="TCC",
                project=Project.objects.get(
                    name="Demo Total Customer Counting Project"
                ),
            )
            tcc_scenario.cameras.set(
                Camera.objects.filter(
                    is_demo=True, name="Scenario 5 - Total Customer Counting"
                )
            )
            tcc_scenario.parts.set(
                Project.objects.get(
                    is_demo=True, name="Demo Total Customer Counting Project"
                ).part_set.all()
            )
            # =============================================
            # Crowded Queue Alert                       ===
            # =============================================
            cqa_scenario = PDScenario.objects.create(
                name="Crowded queue alert",
                inference_mode="CQA",
                project=Project.objects.get(name="Demo Crowded Queue Alert Project"),
            )
            cqa_scenario.cameras.set(
                Camera.objects.filter(
                    is_demo=True, name="Scenario 6 - Crowded Queue Alert"
                )
            )
            cqa_scenario.parts.set(
                Project.objects.get(
                    is_demo=True, name="Demo Crowded Queue Alert Project"
                ).part_set.all()
            )
