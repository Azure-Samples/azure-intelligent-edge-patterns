# -*- coding: utf-8 -*-
"""App API serializers.
"""

import logging

from rest_framework import serializers

from ..models import Camera

logger = logging.getLogger(__name__)


class CameraSerializer(serializers.ModelSerializer):
    """CameraSerializer.
    """

    class Meta:
        model = Camera
        fields = "__all__"

    def create(self, validated_data):
        try:
            return Camera.objects.create(**validated_data)
        except ValueError as value_err:
            raise serializers.ValidationError(detail={
                'status': 'failed',
                'log': str(value_err),
            })

    def update(self, instance, validated_data):
        try:
            result = super().update(instance, validated_data)
            return result
        except ValueError as value_err:
            raise serializers.ValidationError(detail={
                'status': 'failed',
                'log': str(value_err),
            })
