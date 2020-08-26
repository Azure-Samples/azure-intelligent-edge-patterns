"""
App Utilities
"""

import logging

from .models import TrainingStatus

logger = logging.getLogger(__name__)


def upcreate_training_status(project_id,
                             status: str,
                             log: str,
                             performance: str = "{}",
                             need_to_send_notification: bool = False):
    """upcreate_training_status.

    Args:
        project_id:
        status (str): status
        log (str): log
        performance (str): performance
        need_to_send_notification (bool): need_to_send_notification
    """
    logger.info("Updating Training Status: %s", status)
    logger.info("Updating Training Log %s", log)
    obj, created = TrainingStatus.objects.update_or_create(
        project_id=project_id,
        defaults={
            "status": status,
            "log": log.capitalize(),
            "performance": performance,
            "need_to_send_notification": need_to_send_notification,
        },
    )
    return obj, created
