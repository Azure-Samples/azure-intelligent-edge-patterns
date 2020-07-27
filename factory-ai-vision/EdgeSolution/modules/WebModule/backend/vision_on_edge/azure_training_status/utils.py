"""
App Utilities
"""

import logging

from .models import TrainingStatus

logger = logging.getLogger(__name__)

def upcreate_training_status(project_id,
                             status: str,
                             log: str,
                             performance: str = "{}"):
    """upcreate_training_status.

    Args:
        project_id:
        status (str): status
        log (str): log
        performance (str): performance
    """
    logger.info("Updating Training Status: %s", status)
    logger.info("Updating Training Log %s", log)
    obj, created = TrainingStatus.objects.update_or_create(
        project_id=project_id,
        defaults={
            "status": status,
            "log": "Status : " + log.capitalize(),
            "performance": performance,
        },
    )
    return obj, created
