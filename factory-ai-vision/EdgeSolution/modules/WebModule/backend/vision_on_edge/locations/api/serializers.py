"""
Serializers
"""

import logging

from rest_framework import serializers

from ..models import Location

logger = logging.getLogger(__name__)


class LocationSerializer(serializers.ModelSerializer):
    """LocationSerializer"""

    class Meta:
        model = Location
        fields = ["id", "name", "description", "is_demo"]
        extra_kwargs = {
            "description": {
                "required": False
            },
        }
