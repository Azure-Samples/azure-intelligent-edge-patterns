"""App API serializers.
"""

import logging

from django.db.utils import IntegrityError
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from ..exceptions import PartSameNameExistError
from ..models import Part

logger = logging.getLogger(__name__)


class PartSerializer(serializers.ModelSerializer):
    """PartSerializer."""

    class Meta:
        model = Part
        fields = "__all__"
        extra_kwargs = {"description": {"required": False}}

    def create(self, validated_data):
        """create.

        Args:
            validated_data:
        """
        try:
            return Part.objects.create(**validated_data)
        except (IntegrityError, ValidationError):
            raise PartSameNameExistError

    def update(self, instance, validated_data):
        """update.

        Args:
            instance:
            validated_data:
        """
        try:
            result = super().update(instance, validated_data)
            return result
        except (IntegrityError, ValidationError):
            raise PartSameNameExistError
