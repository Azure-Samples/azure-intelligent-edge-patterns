"""
Azure Training Serializers
"""

import logging

from rest_framework import serializers

from ...azure_settings.models import Setting
from ..models import Project, Task, Train

logger = logging.getLogger(__name__)


class ProjectSerializer(serializers.ModelSerializer):
    """Project Serializer"""

    class Meta:
        model = Project
        fields = [
            "setting",
            "id",
            "camera",
            "location",
            "parts",
            "download_uri",
            "customvision_project_id",
            "needRetraining",
            "accuracyRangeMin",
            "accuracyRangeMax",
            "maxImages",
            "metrics_is_send_iothub",
            "metrics_accuracy_threshold",
            "metrics_frame_per_minutes",
            "prob_threshold",
        ]
        extra_kwargs = {
            "setting": {
                "required": False
            },
            "download_uri": {
                "required": False
            },
            "customvision_project_id": {
                "required": False
            },
            "prob_threshold": {
                "required": False
            }
        }

    def create(self, validated_data):
        logger.info("Project Serializer create")
        parts = validated_data.pop("parts")
        if "setting" not in validated_data:
            validated_data["setting"] = Setting.objects.first()
        project = Project.objects.create(**validated_data)
        project.parts.set(parts)
        return project


class TrainSerializer(serializers.ModelSerializer):
    """TrainSerializer"""

    class Meta:
        model = Train
        fields = ["id", "status", "log", "project"]


class TaskSerializer(serializers.ModelSerializer):
    """TaskSerializer"""

    class Meta:
        model = Task
        fields = ["task_type", "status", "log", "project"]
