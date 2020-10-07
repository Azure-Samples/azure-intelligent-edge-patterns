"""App API serializers.
"""

import logging

from rest_framework import serializers

from ..models import Location

logger = logging.getLogger(__name__)


class LocationSerializer(serializers.ModelSerializer):
    """LocationSerializer"""

    class Meta:
        model = Location
        fields = "__all__"
        extra_kwargs = {"description": {"required": False}}
