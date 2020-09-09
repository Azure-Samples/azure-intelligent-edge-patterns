# -*- coding: utf-8 -*-
"""App utilities.
"""

import logging

from .models import DeployStatus

logger = logging.getLogger(__name__)


def upcreate_deploy_status(part_detection_id,
                           status: str,
                           log: str,
                           need_to_send_notification: bool = False):
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

    obj, created = DeployStatus.objects.update_or_create(
        part_detection_id=part_detection_id,
        defaults={
            "status": status,
            "log": log.capitalize(),
            "need_to_send_notification": need_to_send_notification,
        },
    )
    obj.save()
    return obj, created
