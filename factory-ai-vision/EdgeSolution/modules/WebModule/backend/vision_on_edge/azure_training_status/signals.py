"""App signals.
"""

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from ..azure_projects.models import Project
from .models import TrainingStatus

logger = logging.getLogger(__name__)


@receiver(
    signal=post_save,
    sender=Project,
    dispatch_uid="training_status_project_created_listener",
)
def training_status_project_created_listener(**kwargs):
    """Project create change."""

    instance = kwargs["instance"]
    created = kwargs["created"]
    if not created:
        logger.info("Project not created. Pass...")
        return

    logger.info("Azure Project created. Create TrainingStatus object.")
    TrainingStatus.objects.update_or_create(
        project_id=instance.id,
        defaults={
            "status": "ok",
            "log": "Status : Has not configured",
            "performance": "{}",
        },
    )
