"""App API serializers.
"""

import logging

from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers

from ...general.shortcuts import drf_get_object_or_404
from ..constants import INFERENCE_PROTOCOL_CHOICES
from ..models import PartDetection, PDScenario

logger = logging.getLogger(__name__)


class PartDetectionSerializer(serializers.ModelSerializer):
    """Part Detection Serializer"""

    class SendVideoToCloudInfoSerializer(serializers.Serializer):
        camera_id = serializers.IntegerField()
        send_video_to_cloud = serializers.BooleanField()

    send_video_to_cloud = SendVideoToCloudInfoSerializer(many=True, required=False)

    class Meta:
        model = PartDetection
        fields = [
            "name",
            "accuracyRangeMax",
            "accuracyRangeMin",
            "cameras",
            "deploy_timestamp",
            "deployed",
            "fps",
            "has_configured",
            "inference_mode",
            "inference_module",
            "inference_protocol",
            "inference_source",
            "maxImages",
            "metrics_frame_per_minutes",
            "metrics_is_send_iothub",
            "needRetraining",
            "parts",
            "prob_threshold",
            "project",
            "send_video_to_cloud",
        ]
        extra_kwargs = {
            "prob_threshold": {"required": False},
            "send_video_to_cloud": {"required": False},
        }

    def update(self, instance, validated_data):

        for attr in [
            "name",
            "accuracyRangeMax",
            "accuracyRangeMin",
            # "cameras",
            # "deploy_timestamp",
            "deployed",
            "fps",
            "has_configured",
            "inference_mode",
            "inference_module",
            "inference_protocol",
            "inference_source",
            "maxImages",
            "metrics_frame_per_minutes",
            "metrics_is_send_iothub",
            "needRetraining",
            # "parts",
            "prob_threshold",
            "project",
            # "send_video_to_cloud",
        ]:
            setattr(instance, attr, validated_data[attr])
        instance.cameras.set(validated_data.pop("cameras"))
        instance.parts.set(validated_data.pop("parts"))
        if "send_video_to_cloud" in validated_data:
            send_video_to_cloud = validated_data.pop("send_video_to_cloud")
            for svtc_info in send_video_to_cloud:
                camera = drf_get_object_or_404(
                    instance.cameras.all(), pk=svtc_info["camera_id"]
                )
                camera.send_video_to_cloud = svtc_info["send_video_to_cloud"]
                camera.save()
        instance.save()
        return instance


class PDScenarioSerializer(serializers.ModelSerializer):
    """Project Serializer"""

    class Meta:
        model = PDScenario
        fields = "__all__"


# pylint: disable=abstract-method
class ExportSerializer(serializers.Serializer):
    """ExportSerializer."""

    class ScenarioMetrics(serializers.Serializer):
        """ScenarioMetrics."""

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
    """UploadRelabelSerializer."""

    part_name = serializers.CharField()
    labels = serializers.CharField()
    img = Base64ImageField(required=True)
    confidence = serializers.FloatField()
    is_relabel = serializers.BooleanField()
    camera_id = serializers.IntegerField()


class UpdateCamBodySerializer(serializers.Serializer):
    """UploadRelabelSerializer."""

    class CameraItem(serializers.Serializer):
        """CameraItem."""

        id = serializers.CharField()
        type = serializers.CharField()
        source = serializers.CharField()
        aoi = serializers.CharField(required=False)
        lines = serializers.CharField(required=False, allow_blank=True)
        zones = serializers.CharField(required=False, allow_blank=True)

    lva_mode = serializers.ChoiceField(INFERENCE_PROTOCOL_CHOICES)
    fps = serializers.IntegerField()
    cameras = CameraItem(many=True)
