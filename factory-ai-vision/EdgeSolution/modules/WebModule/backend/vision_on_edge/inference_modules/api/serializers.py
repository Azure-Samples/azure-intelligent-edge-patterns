"""App API serializers.
"""

import logging

from rest_framework import serializers

from ..models import InferenceModule

logger = logging.getLogger(__name__)


class InferenceModuleSerializer(serializers.ModelSerializer):
    """InferenceModuleSerializer"""

    recommended_fps = serializers.IntegerField(required=False, read_only=True)

    class Meta:
        model = InferenceModule
        fields = "__all__"
