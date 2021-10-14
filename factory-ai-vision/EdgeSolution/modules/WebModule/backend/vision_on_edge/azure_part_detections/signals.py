"""App signals.
"""

import logging
import requests

from django.db.models.signals import m2m_changed, post_save, pre_save
from django.dispatch import receiver

from ..cameras.models import Camera
from ..azure_cascades.models import Cascade
from .models import PartDetection
from .utils import deploy_all_helper
from..azure_iot.utils import model_manager_module_url

logger = logging.getLogger(__name__)


@receiver(
    signal=pre_save,
    sender=PartDetection,
    dispatch_uid="azure_part_detection_has_configured_handler",
)
def azure_part_detection_has_configured_handler(**kwargs):
    """PartDetection is_configured handler

    For now, only one project can have is configured = True
    """

    instance = kwargs["instance"]
    logger.info("Changing has_configured")
    if instance.has_configured:
        for other_pd in PartDetection.objects.exclude(id=instance.id):
            other_pd.has_configured = False
            other_pd.save()
    logger.info("Signal end")


@receiver(
    signal=post_save,
    sender=PartDetection,
    dispatch_uid="azure_part_detection_post_save_deploy_handler",
)
def azure_part_detection_post_save_deploy_handler(**kwargs):
    """Project is_configured handler"""
    instance = kwargs["instance"]
    # set_voe_config
    logger.warning("cascade post save: send config to model manager")

    if instance.deployment_type == "cascade":
        url = "http://" + str(model_manager_module_url()) + "/set_voe_config"
        data = {"config": instance.cascade.flow}
        res = requests.post(url, json=data)
        logger.warning(res.text)

    deploy_all_helper(part_detection_id=instance.id)


@receiver(
    signal=m2m_changed,
    sender=PartDetection.cameras.through,
    dispatch_uid="azure_part_detection_camera_m2m_change",
)
def azure_part_detection_camera_m2m_change(**kwargs):
    """azure_part_detection_camera_m2m_change.

    Args:
        kwargs:
    """
    action = kwargs["action"]
    instance = kwargs["instance"]
    if action in ["post_add", "post_remove"]:
        deploy_all_helper(part_detection_id=instance.id)


@receiver(
    signal=post_save,
    sender=Camera,
    dispatch_uid="azure_part_detection_camera_config_change_handler",
)
def azure_part_detection_camera_config_change_handler(**kwargs):
    """azure_part_detection_camera_config_change_handler.

    Args:
        kwargs:
    """
    instance = kwargs["instance"]
    part_detection_objs = PartDetection.objects.filter(cameras=instance)
    for part_detection_obj in part_detection_objs:
        deploy_all_helper(part_detection_id=part_detection_obj.id)
