"""App API serializers.
"""

import logging

from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers

from ...camera_tasks.api.serializers import CameraTaskSerializer
from ...camera_tasks.models import CameraTask
from ...general.shortcuts import drf_get_object_or_404
from ..constants import INFERENCE_PROTOCOL_CHOICES
from ..models import PartDetection, PDScenario

logger = logging.getLogger(__name__)


class PartDetectionSerializer(serializers.ModelSerializer):
    """Part Detection Serializer"""

    send_video_to_cloud = CameraTaskSerializer(many=True, required=False, partial=True)

    class Meta:
        model = PartDetection
        fields = [
            "id",
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
            "ava_is_send_iothub",
            "needRetraining",
            "parts",
            "prob_threshold",
            "max_people",
            "counting_start_time",
            "counting_end_time",
            "project",
            "cascade",
            "deployment_type",
            "send_video_to_cloud",
            "disable_video_feed",
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
            "ava_is_send_iothub",
            "needRetraining",
            # "parts",
            "prob_threshold",
            "project",
            "cascade",
            "deployment_type",
            # "send_video_to_cloud",
            "disable_video_feed",
            "counting_start_time",
            "counting_end_time",
        ]:
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])
        instance.cameras.set(validated_data.pop("cameras"))
        instance.parts.set(validated_data.pop("parts"))
        if "send_video_to_cloud" in validated_data:
            camera_tasks = validated_data.pop("send_video_to_cloud")
            for camera_task in camera_tasks:
                camera_task_instance = drf_get_object_or_404(
                    CameraTask.objects.filter(camera_id__in=instance.cameras.all()),
                    camera_id=camera_task["camera"],
                )
                serializer = CameraTaskSerializer(
                    instance=camera_task_instance,
                    data=CameraTaskSerializer(camera_task).data,
                    partial=True,
                )
                if serializer.is_valid(raise_exception=True):
                    serializer.save()
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

        class Parts(serializers.Serializer):
            id = serializers.CharField()
            name = serializers.CharField()

        id = serializers.CharField()
        name = serializers.CharField()
        type = serializers.CharField()
        source = serializers.CharField()
        aoi = serializers.CharField(required=False)
        lines = serializers.CharField(required=False, allow_blank=True)
        zones = serializers.CharField(required=False, allow_blank=True)
        send_video_to_cloud = serializers.BooleanField()
        send_video_to_cloud_parts = Parts(many=True)
        send_video_to_cloud_threshold = serializers.IntegerField()
        recording_duration = serializers.IntegerField()
        enable_tracking = serializers.BooleanField()
        counting_start_time = serializers.CharField(required=False, allow_blank=True)
        counting_end_time = serializers.CharField(required=False, allow_blank=True)

    lva_mode = serializers.ChoiceField(INFERENCE_PROTOCOL_CHOICES)
    ava_is_send = serializers.BooleanField()
    fps = serializers.FloatField()
    cascade_name = serializers.CharField()
    cameras = CameraItem(many=True)
