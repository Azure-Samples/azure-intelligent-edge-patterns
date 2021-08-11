"""App helpers
"""
import logging
import json

from ..azure_iot.utils import prediction_module_url, yolo_module_url
from ..azure_settings.constants import DEFAULT_SETTING_NAME
from ..azure_settings.models import Setting
from .models import Project

logger = logging.getLogger(__name__)


def create_default_objects():
    """create_default_objects"""
    logger.info("Create/update a default project.")
    setting_obj = Setting.objects.first()
    project_obj = Project.objects.filter(is_demo=False, setting=setting_obj).first()
    if project_obj:
        setattr(project_obj, "prediction_uri", prediction_module_url())
        project_obj.save()
    else:
        Project.objects.update_or_create(
            is_demo=False,
            setting=setting_obj,
            defaults={
                "prediction_uri": prediction_module_url(),
            },
        )


def create_demo_objects():
    """create demo objects"""
    logger.info("Creating demo projects.")

    # Default Settings should be created already
    default_settings = Setting.objects.filter(name=DEFAULT_SETTING_NAME)

    if not default_settings.exists():
        logger.info("Cannot find default settings....")
        return
    # =============================================
    # Simple Part Detection                     ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Part Detection Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "download_uri": "default_model_6parts",
            "prediction_uri": "ovms-app:5010/score",
        },
    )
    # =============================================
    # Part Counting                             ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Part Counting Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "download_uri": "scenario_models/1",
            "prediction_uri": "ovms-app:5010/score",
        },
    )
    # =============================================
    # Employee safety                           ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Employee Safety Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "download_uri": "scenario_models/2",
            "prediction_uri": "ovms-app:5010/score",
        },
    )
    # =============================================
    # Defect Detection                          ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Defect Detection Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "download_uri": "scenario_models/3",
            "prediction_uri": "ovms-app:5010/score",
        },
    )
    logger.info("Create demo project end.")

    # =============================================
    # Empty Shelf Alert                         ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Empty Shelf Alert Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "download_uri": "scenario_models/4",
            "prediction_uri": "ovms-app:5010/score",
        },
    )

    # =============================================
    # Total Customer Counting                   ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Total Customer Counting Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "download_uri": "scenario_models/5",
            "prediction_uri": "ovms-app:5010/score",
        },
    )

    # =============================================
    # Crowded Queue Alert                       ===
    # =============================================
    Project.objects.update_or_create(
        name="Demo Crowded Queue Alert Project",
        setting=default_settings.first(),
        defaults={
            "is_demo": True,
            "download_uri": "scenario_models/6",
            "prediction_uri": "ovms-app:5010/score",
        },
    )

    # =============================================
    # Cascade Demo Nodes                        ===
    # =============================================

    # face detection
    inputs = [
        {
            "name": "image",
            "width": 300,
            "height": 300,
            "data_type": "FP32",
            "dims": ["B", "C", "H", "W"],
            "color_format": "BGR",
        }
    ]
    outputs = [
        {
            "name": "bounding_box",
            "dims": [1, 1, "N", ["I", "L", "Conf", "x_min", "y_min", "x_max", "x_min"]]
        }
    ]
    block_inputs = json.dumps(inputs)
    block_outputs = json.dumps(outputs)
    Project.objects.update_or_create(
        name="face-detection-retail-0004",
        defaults={
            "is_cascade": True,
            "block_inputs": block_inputs,
            "block_outputs": block_outputs,
        },
    )

    # emotion recognition
    inputs = [
        {
            "name": "image",
            "width": 64,
            "height": 64,
            "data_type": "FP32",
            "dims": ["B", "C", "H", "W"],
            "color_format": "BGR",
        }
    ]
    outputs = [
        {
            "name": "classification",
            "dims": ["B", ["P"], 1, 1]
        }
    ]
    block_inputs = json.dumps(inputs)
    block_outputs = json.dumps(outputs)
    Project.objects.update_or_create(
        name="emotions-recognition-retail-0003",
        defaults={
            "is_cascade": True,
            "block_inputs": block_inputs,
            "block_outputs": block_outputs,
        },
    )

    # age/gender recognition
    inputs = [
        {
            "name": "image",
            "width": 64,
            "height": 64,
            "data_type": "FP32",
            "dims": ["B", "C", "H", "W"],
            "color_format": "BGR",
        }
    ]
    outputs = [
        {
            "name": "classification",
            "dims": ["N", 1, "V", 1]
        },
        {
            "name": "classification",
            "dims": ["N", 1, ["P"], 1]
        }
    ]
    block_inputs = json.dumps(inputs)
    block_outputs = json.dumps(outputs)
    Project.objects.update_or_create(
        name="age-gender-recognition-retail-0013",
        defaults={
            "is_cascade": True,
            "block_inputs": block_inputs,
            "block_outputs": block_outputs,
        },
    )

    # Crop
    inputs = [
        {   
            "name": "image",
            "width": 64,
            "height": 64,
            "data_type": "FP32",
            "dims": ["B", "C", "H", "W"],
            "color_format": "BGR",
        },
    ]
    outputs = [
        {   
            "name": "image",
            "width": 64,
            "height": 64,
            "data_type": "FP32",
            "dims": ["B", "C", "H", "W"],
            "color_format": "BGR",
        },
    ]
    block_inputs = json.dumps(inputs)
    block_outputs = json.dumps(outputs)
    Project.objects.update_or_create(
        name="Crop",
        defaults={
            "is_cascade": True,
            "block_inputs": block_inputs,
            "block_outputs": block_outputs,
        },
    )
