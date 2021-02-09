"""App.
"""

import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


# pylint: disable=unused-import, import-outside-toplevel
class AzurePDDeployStatusConfig(AppConfig):
    """App Config"""

    name = "vision_on_edge.azure_pd_deploy_status"

    def ready(self):
        """ready."""
        if "runserver" in sys.argv:
            from ..azure_part_detections.models import PartDetection
            from . import signals  # noqa: F401
            from .models import DeployStatus

            for pd in PartDetection.objects.all():
                try:
                    pd.deploystatus
                except PartDetection.deploystatus.RelatedObjectDoesNotExist:
                    DeployStatus.objects.create(part_detection=pd)
            for ds_obj in DeployStatus.objects.all():
                if ds_obj.status not in ["ok", "failed"]:
                    ds_obj.status = "ok"
                    ds_obj.log = "reset by app"
                    ds_obj.save()
