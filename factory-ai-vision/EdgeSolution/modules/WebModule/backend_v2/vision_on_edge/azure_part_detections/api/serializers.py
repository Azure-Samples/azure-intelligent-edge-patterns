# -*- coding: utf-8 -*-
"""App Serializers
"""

import logging

from rest_framework import serializers

from ..models import PartDetection

logger = logging.getLogger(__name__)


class PartDetectionSerializer(serializers.ModelSerializer):
    """Project Serializer"""

    class Meta:
        model = PartDetection
        fields = '__all__'
        extra_kwargs = {"prob_threshold": {"required": False}}


# pylint: disable=abstract-method
class ExportSerializer(serializers.Serializer):
    """ExportSerializer.
    """

    status = serializers.CharField(max_length=100)
    log = serializers.CharField(max_length=1000)
    download_uri = serializers.CharField(max_length=1000)
    success_rate = serializers.FloatField(default=0.0)
    inference_num = serializers.FloatField(default=0.0)
    unidentified_num = serializers.IntegerField(default=0)
    gpu = serializers.BooleanField(default=False)
    average_time = serializers.FloatField(default=0.0)
    count = serializers.IntegerField(default=0)
