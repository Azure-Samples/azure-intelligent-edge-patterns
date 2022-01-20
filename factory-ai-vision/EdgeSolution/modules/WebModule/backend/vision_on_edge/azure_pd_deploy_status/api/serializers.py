"""App API serializers.
"""

import logging

from rest_framework import serializers

from ..models import DeployStatus

logger = logging.getLogger(__name__)


class DeployStatusSerializer(serializers.ModelSerializer):
    """DeployStatusSerializer."""

    class Meta:
        model = DeployStatus
        fields = "__all__"
