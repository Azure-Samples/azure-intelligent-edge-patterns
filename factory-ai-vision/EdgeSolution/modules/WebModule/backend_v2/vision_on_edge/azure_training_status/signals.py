# -*- coding: utf-8 -*-
"""App Signals
"""

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import TrainingStatus
from ..azure_projects.models import Project

logger = logging.getLogger(__name__)


@receiver(signal=post_save,
          sender=Project,
          dispatch_uid="training_status_project_created_listener")
def training_status_project_created_listener(**kwargs):
    """Project create change.
    """
    instance = kwargs['instance']
    created = kwargs['created']
    if created:
        logger.info("Azure Project created. Create TrainingStatus Object")
        TrainingStatus.objects.update_or_create(
            project_id=instance.id,
            defaults={
                "status": "ok",
                "log": "Status : Has not configured",
                "performance": ""
            },
        )
    else:
        logger.info("Project not created. Pass...")
