"""App API serializers.
"""

import logging

from rest_framework import serializers

from ..models import Camera

logger = logging.getLogger(__name__)


class CameraSerializer(serializers.ModelSerializer):
    """CameraSerializer."""

    class Meta:
        model = Camera
        fields = "__all__"
