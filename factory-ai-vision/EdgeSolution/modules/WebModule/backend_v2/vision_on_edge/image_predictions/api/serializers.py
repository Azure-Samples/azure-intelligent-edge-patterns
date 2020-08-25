"""
Image Prediction Serializer
"""

import logging

from rest_framework import serializers

from ..models import ImagePrediction

logger = logging.getLogger(__name__)


class ImagePredictionSerializer(serializers.ModelSerializer):
    """Image Prediction Serializer"""

    class Meta:
        model = ImagePrediction
        fields = "__all__"
        extra_kwargs = {
            "predicted": {
                "required": False
            },
        }
