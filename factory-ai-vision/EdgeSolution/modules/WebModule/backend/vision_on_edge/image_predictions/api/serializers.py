"""App API serializers.
"""

import logging

from rest_framework import serializers

from ..models import ImagePrediction

logger = logging.getLogger(__name__)


class ImagePredictionSerializer(serializers.ModelSerializer):
    """ImagePredictionSerializer."""

    class Meta:
        model = ImagePrediction
        fields = "__all__"
        extra_kwargs = {"predicted": {"required": False}}
