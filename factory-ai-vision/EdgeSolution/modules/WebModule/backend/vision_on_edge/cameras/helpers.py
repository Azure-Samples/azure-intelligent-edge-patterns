"""App helpers.

Depends on models.py
"""

import logging

from ..locations.models import Location
from .constants import (
    gen_default_lines,
    gen_default_lines_dd,
    gen_default_zones,
    gen_default_zones_cqa,
    gen_default_zones_esa,
    gen_default_zones_tcc,
)
from .models import Camera

logger = logging.getLogger(__name__)


def create_demo_objects():
    """create_demo_objects."""
    logger.info("Creating demo objects.")
    if not Location.objects.filter(is_demo=True).exists():
        return

    # =========================================
    # Demo: Part Detection                    =
    # =========================================
    demo_location_obj = Location.objects.filter(is_demo=True).first()
    cam_obj, created = Camera.objects.update_or_create(
        name="Demo Video",
        is_demo=True,
        defaults={
            "rtsp": "rtsp://rtspsim:554/media/video.mkv",
            "area": "",
            "location": demo_location_obj,
        },
    )
    logger.info("Camera: %s %s.", cam_obj, "created" if created else "updated")

    # =========================================
    # Scenario 1: Counting Objects            =
    # =========================================
    logger.info("Creating a scenario 1 camera object.")
    cam_obj, created = Camera.objects.update_or_create(
        name="Scenario 1 - Counting Objects",
        is_demo=True,
        defaults={
            "rtsp": "rtsp://rtspsim:554/media/scenario1-counting-objects.mkv",
            "area": "",
            "lines": gen_default_lines(),
            "danger_zones": "",
            "location": demo_location_obj,
        },
    )
    logger.info("Camera: %s %s.", cam_obj, "created" if created else "updated")

    # =========================================
    # Scenario 2: Employ Safety               =
    # =========================================
    logger.info("Creating a scenario 2 employ safety.")
    cam_obj, created = Camera.objects.update_or_create(
        name="Scenario 2 - Employ Safety",
        is_demo=True,
        defaults={
            "rtsp": "rtsp://rtspsim:554/media/scenario2-employ-safety.mkv",
            "area": "",
            "lines": "",
            "danger_zones": gen_default_zones(),
            "location": demo_location_obj,
        },
    )
    logger.info("Camera: %s %s.", cam_obj, "created" if created else "updated")

    # =========================================
    # Scenario 3: Defect Detection            =
    # =========================================
    logger.info("Creating a scenario 3 defect detection.")
    cam_obj, created = Camera.objects.update_or_create(
        name="Scenario 3 - Defect Detection",
        is_demo=True,
        defaults={
            "rtsp": "rtsp://rtspsim:554/media/scenario3-defect-detection.mkv",
            "area": "",
            "lines": gen_default_lines_dd(),
            "danger_zones": "",
            "location": demo_location_obj,
        },
    )
    logger.info("Camera: %s %s.", cam_obj, "created" if created else "updated")

    # =========================================
    # Scenario 4: Empty Shelf Alert           =
    # =========================================
    logger.info("Creating a scenario 4 empty shelf alert.")
    cam_obj, created = Camera.objects.update_or_create(
        name="Scenario 4 - Empty Shelf Alert",
        is_demo=True,
        defaults={
            "rtsp": "rtsp://rtspsim:554/media/scenario4-empty-shelf-alert.mkv",
            "area": "",
            "lines": "",
            "danger_zones": "",
            "location": demo_location_obj,
        },
    )
    logger.info("Camera: %s %s.", cam_obj, "created" if created else "updated")

    # =========================================
    # Scenario 5: Total Customer Counting     =
    # =========================================
    logger.info("Creating a scenario 5 total customer counting.")
    cam_obj, created = Camera.objects.update_or_create(
        name="Scenario 5 - Total Customer Counting",
        is_demo=True,
        defaults={
            "rtsp": "rtsp://rtspsim:554/media/scenario5-total-customer-counting_old.mkv",
            "area": "",
            "lines": "",
            "danger_zones": gen_default_zones_tcc(),
            "location": demo_location_obj,
        },
    )
    logger.info("Camera: %s %s.", cam_obj, "created" if created else "updated")

    # =========================================
    # Scenario 6: Crowded Queue Alert         =
    # =========================================
    logger.info("Creating a scenario 6 crowded queue alert.")
    cam_obj, created = Camera.objects.update_or_create(
        name="Scenario 6 - Crowded Queue Alert",
        is_demo=True,
        defaults={
            "rtsp": "rtsp://rtspsim:554/media/scenario5-total-customer-counting_old.mkv",
            "area": "",
            "lines": "",
            "danger_zones": gen_default_zones_cqa(),
            "location": demo_location_obj,
        },
    )
    logger.info("Camera: %s %s.", cam_obj, "created" if created else "updated")
