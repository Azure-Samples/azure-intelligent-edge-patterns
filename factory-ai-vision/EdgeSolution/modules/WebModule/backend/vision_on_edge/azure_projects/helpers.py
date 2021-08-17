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
    
    # source
    outputs_ = [
        {
            "name": "image",
            "metadata": {
                "type": "image",
                "shape": [1, 3, 416, 416],
                "layout": ["N", "H", "W", "C"],
                "color_format": "BGR",
            }
        }
    ]

    outputs = json.dumps(outputs_)
    Project.objects.update_or_create(
        name="request",
        defaults={
            "is_cascade": True,
            "type": "source",
            "inputs": "",
            "outputs": outputs,
        },
    )
    # face detection
    inputs_ = [
        {
            "name": "data",
            "metadata": {
                "type": "image",    
                "shape": [1, 3, 416, 416],
                "layout": ["N", "H", "W", "C"],
                "color_format": "BGR",
            }
        }
    ]
    outputs_ = [
        {
            "name": "detection_out",
            "metadata": {
                "type": "bounding_box",
                "shape": [1, 1, 200, 7],
                "layout": [1, 1, "B", "F"],
            }
        }
    ]
    inputs = json.dumps(inputs_)
    outputs = json.dumps(outputs_)
    Project.objects.update_or_create(
        name="face_detection",
        defaults={
            "is_cascade": True,
            "type": "openvino_model",
            "openvino_model_name": "face-detection-retail-0004",
            "inputs": inputs,
            "outputs": outputs,
        },
    )

    # emotion recognition
    inputs_ = [
        {
            "name": "data",
            "metadata": {
                "type": "image",
                "shape": [1, 3, 64, 64],
                "layout": ["N", "H", "W", "C"],
            }
        }
    ]
    outputs_ = [
        {
            "name": "prob_emotion",
            "metadata": {
                "type": "classification",
                "shape": [1, 5, 1, 1],
                "layout": [1, "C", 1, 1],
            }
        }
    ]
    inputs = json.dumps(inputs_)
    outputs = json.dumps(outputs_)
    Project.objects.update_or_create(
        name="emotion_recognition",
        defaults={
            "is_cascade": True,
            "type": "openvino_model",
            "openvino_model_name": "emotions-recognition-retail-0003",
            "inputs": inputs,
            "outputs": outputs,
        },
    )

    # age/gender recognition
    inputs_ = [
        {
            "name": "data",
            "metadata": {
                "type": "image",
                "shape": [1, 3, 64, 64],
                "layout": ["N", "H", "W", "C"],
            }
        }
    ]
    outputs_ = [
        {
            "name": "age_conv3",
            "metadata": {
                "type": "regression",
                "shape": [1, 1, 1, 1],
                "layout": [1, 1, 1, 1],
            }
        },
        {
            "name": "prob",
            "metadata": {
                "type": "classfication",
                "shape": [1, 2, 1, 1],
                "layout": [1, "P", 1, 1],
            }
        }
    ]
    inputs = json.dumps(inputs_)
    outputs = json.dumps(outputs_)
    Project.objects.update_or_create(
        name="age_gender_recognition",
        defaults={
            "is_cascade": True,
            "type": "openvino_model",
            "openvino_model_name": "age-gender-recognition-retail-0013",
            "inputs": inputs,
            "outputs": outputs,
        },
    )

    # Crop
    inputs_ = [
        {
            "name": "image",
            "metadata": {
                "type": "image",
                "shape": [1, 3, 416, 416],
                "layout": ["N", "H", "W", "C"],
                "color_format": "BGR",
            }
        },
        {
            "name": "detection",
            "metadata": {
                "type": "bounding_box",
                "shape": [1, 1, 200, 7],
                "layout": [1, 1, "B", "F"],
            }
        }
    ]
    outputs_ = [
        {
            "name": "images",
            "metadata": {
                "type": "image",
                "shape": [-1, 1, 3, 64, 64],
                "layout": ["B", "N", "H", "W", "C"],
                "color_format": "BGR",
            }
        },
        {
            "name": "coordinates",
            "metadata": {
                "type": "bounding_box",
                "shape": [-1, 1, 1, 200, 7],
                "layout": ["B", 1, 1, "B", "F"],
            }
        },
        {
            "name": "confidences",
            "metadata": {
                "type": "regression",
                "shape": [-1, 1, 1, 1, 1],
                "layout": ["B", 1, 1, "B", "F"],
            }
        }
    ]
    inputs = json.dumps(inputs_)
    outputs = json.dumps(outputs_)
    Project.objects.update_or_create(
        name="crop",
        defaults={
            "is_cascade": True,
            "type": "openvino_library",
            "openvino_library_name": "libcustom_node_model_zoo_intel_object_detection.so",
            "inputs": inputs,
            "outputs": outputs,
            "demultiply_count": 0,
            "params": json.dumps({
                "original_image_width": "416",
                "original_image_height": "416",
                "target_image_width": "64",
                "target_image_height": "64",
                "original_image_layout": "NHWC",
                "target_image_layout": "NHWC",
                "convert_to_gray_scale": "false",
                "max_output_batch": "100",
                "confidence_threshold": "0.7",
                "debug": "true"
            }),
        },
    )

    # sink*5
    Project.objects.update_or_create(
        name="face_images",
        defaults={
            "is_cascade": True,
            "type": "sink",
            "combined": "true",
            "inputs": json.dumps([
                {"name": "face_images"}
            ])
        },
    )

    Project.objects.update_or_create(
        name="face_coordinates",
        defaults={
            "is_cascade": True,
            "type": "sink",
            "combined": "true",
            "inputs": json.dumps([
                {"name": "data"}
            ])
        },
    )

    Project.objects.update_or_create(
        name="confidence_levels",
        defaults={
            "is_cascade": True,
            "type": "sink",
            "combined": "true",
            "inputs": json.dumps([
                {"name": "data"}
            ])
        },
    )

    Project.objects.update_or_create(
        name="ages",
        defaults={
            "is_cascade": True,
            "type": "sink",
            "combined": "true",
            "inputs": json.dumps([
                {"name": "data"}
            ])
        },
    )

    Project.objects.update_or_create(
        name="genders",
        defaults={
            "is_cascade": True,
            "type": "sink",
            "combined": "true",
            "inputs": json.dumps([
                {"name": "data"}
            ])
        },
    )

    Project.objects.update_or_create(
        name="emotions",
        defaults={
            "is_cascade": True,
            "type": "sink",
            "combined": "true",
            "inputs": json.dumps([
                {"name": "data"}
            ])
        },
    )
