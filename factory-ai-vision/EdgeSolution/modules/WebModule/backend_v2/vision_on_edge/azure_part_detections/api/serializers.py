# -*- coding: utf-8 -*-
"""App API serializers.
"""

import logging

from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers

from ..models import PartDetection, PDScenario

logger = logging.getLogger(__name__)


class PartDetectionSerializer(serializers.ModelSerializer):
    """Part Detection Serializer"""

    class Meta:
        model = PartDetection
        fields = '__all__'
        extra_kwargs = {"prob_threshold": {"required": False}}


class PDScenarioSerializer(serializers.ModelSerializer):
    """Project Serializer"""

    class Meta:
        model = PDScenario
        fields = '__all__'


# pylint: disable=abstract-method
class ExportSerializer(serializers.Serializer):
    """ExportSerializer.
    """

    class ScenarioMetrics(serializers.Serializer):
        """ScenarioMetrics.
        """
        name = serializers.CharField(required=False)  # DD
        count = serializers.IntegerField(required=False)  # PC, DD

    status = serializers.CharField(max_length=100)
    log = serializers.CharField(max_length=1000)
    download_uri = serializers.CharField(max_length=1000)
    success_rate = serializers.FloatField(default=0.0)
    inference_num = serializers.FloatField(default=0.0)
    unidentified_num = serializers.IntegerField(default=0)
    gpu = serializers.BooleanField(default=False)
    average_time = serializers.FloatField(default=0.0)
    scenario_metrics = ScenarioMetrics(many=True)


class UploadRelabelSerializer(serializers.Serializer):
    """UploadRelabelSerializer.
    """

    part_name = serializers.CharField()
    labels = serializers.CharField()
    img = Base64ImageField(required=True)
    confidence = serializers.FloatField()
    is_relabel = serializers.BooleanField()
    camera_id = serializers.IntegerField()


class UpdateCamBodySerializer(serializers.Serializer):
    """UploadRelabelSerializer.
    """

    class CameraItem(serializers.Serializer):
        """CameraItem.
        """
        id = serializers.CharField()
        type = serializers.CharField()
        source = serializers.CharField()
        aoi = serializers.CharField(required=False)
        lines = serializers.CharField(required=False, allow_blank=True)
        zones = serializers.CharField(required=False, allow_blank=True)

    cameras = CameraItem(many=True)
