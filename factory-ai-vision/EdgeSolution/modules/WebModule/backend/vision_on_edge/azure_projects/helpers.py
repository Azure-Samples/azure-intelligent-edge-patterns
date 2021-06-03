"""App helpers
"""
import logging

from ..azure_iot.utils import prediction_module_url, yolo_module_url
from ..azure_settings.constants import DEFAULT_SETTING_NAME
from ..azure_settings.models import Setting
from .models import Project

logger = logging.getLogger(__name__)


def create_default_objects():
    """create_default_objects"""
    logger.info("Create/update a default project.")
    setting_obj = Setting.objects.first()
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
            "prediction_uri": prediction_module_url(),
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
            "prediction_uri": prediction_module_url(),
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
            "prediction_uri": prediction_module_url(),
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
            "prediction_uri": prediction_module_url(),
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
            "prediction_uri": prediction_module_url(),
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
            "prediction_uri": prediction_module_url(),
        },
    )
