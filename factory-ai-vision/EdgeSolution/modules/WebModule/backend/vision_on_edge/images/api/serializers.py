"""App API serializers.
"""

import logging

from rest_framework import serializers

from ..models import Image

logger = logging.getLogger(__name__)


class ImageSerializer(serializers.ModelSerializer):
    """ImageSerializer."""

    class Meta:
        model = Image
        fields = "__all__"
