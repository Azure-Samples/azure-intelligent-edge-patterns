"""App API serializers.
"""

import logging

from rest_framework import serializers

from ..models import InferenceModule

logger = logging.getLogger(__name__)


class InferenceModuleSerializer(serializers.ModelSerializer):
    """InferenceModuleSerializer"""

    device = serializers.CharField(required=False, read_only=True)
    upload_status = serializers.CharField(required=False, read_only=True)
    recommended_fps = serializers.FloatField(required=False, read_only=True)

    class Meta:
        model = InferenceModule
        fields = "__all__"
