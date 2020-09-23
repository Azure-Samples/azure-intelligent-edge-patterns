"""App utilities.
"""

import logging

from .models import DeployStatus

logger = logging.getLogger(__name__)


def upcreate_deploy_status(
    part_detection_id, status: str, log: str, need_to_send_notification: bool = False
) -> None:
    """upcreate_deploy_status.

    Consider using progress.X to replace status and log.

    Args:
        part_detection_id: Django ORM part_detection id
        status (str): status
        log (str): log
        need_to_send_notification (bool): need_to_send_notification
    """
    logger.info("Updating Deploy Status     :%s", status)
    logger.info("Updating Deploy Log        :%s", log)
    logger.info("need_to_send_notification  :%s", need_to_send_notification)

    deploy_status_obj = DeployStatus.objects.get(part_detection_id=part_detection_id)
    deploy_status_obj.status = status
    deploy_status_obj.log = log.capitalize()
    deploy_status_obj.need_to_send_notification = need_to_send_notification
    deploy_status_obj.save()
