"""App API serializers.
"""

import logging

from rest_framework import serializers

from ..models import CameraTask

logger = logging.getLogger(__name__)


class CameraTaskSerializer(serializers.ModelSerializer):
    """Part Detection Serializer"""

    class Meta:
        model = CameraTask
        exclude = ["id", "name"]
