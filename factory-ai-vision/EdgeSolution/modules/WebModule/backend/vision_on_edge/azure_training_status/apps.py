"""App.
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class AzureTrainingStatusConfig(AppConfig):
    """App Config"""

    name = "vision_on_edge.azure_training_status"

    def ready(self):
        """ready."""

        if "runserver" in sys.argv:
            # pylint: disable=unused-import, import-outside-toplevel
            from ..azure_projects.models import Project
            from . import signals  # noqa: F401
            from .models import TrainingStatus

            # pylint: disable = no-member
            for project in Project.objects.all():
                try:
                    ts_obj = project.trainingstatus
                except Project.trainingstatus.RelatedObjectDoesNotExist:
                    TrainingStatus.objects.create(project=project)
            for ts_obj in TrainingStatus.objects.all():
                if ts_obj.status not in ["ok", "Failed"]:
                    ts_obj.status = "ok"
                    ts_obj.log = "reset by app"
                    ts_obj.save()
