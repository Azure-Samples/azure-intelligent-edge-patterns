"""App API serializers.
"""

import logging

from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers

from ...general.shortcuts import drf_get_object_or_404
from ..models import CameraTask

logger = logging.getLogger(__name__)


class CameraTaskSerializer(serializers.ModelSerializer):
    """Part Detection Serializer"""

    id = serializers.CharField()

    class Meta:
        model = CameraTask
        fields = "__all__"
