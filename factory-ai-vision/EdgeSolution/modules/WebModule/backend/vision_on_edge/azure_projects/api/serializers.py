"""App serializers.
"""

import logging

from drf_extra_fields.fields import Base64FileField
from rest_framework import serializers

from ...azure_parts.models import Part
from ..models import Project, Task

logger = logging.getLogger(__name__)


class LabelTxtBase64File(Base64FileField):
    ALLOWED_TYPES = ["txt"]

    class Meta:
        swagger_schema_fields = {
            "type": "string",
            "title": "Label txt (base64)",
            "description": "Label txt base64 encoded content",
            "read_only": False,
            "write_only": True,
        }

    def get_file_extension(self, filename, decoded_file):
        return "txt"


class ProjectSerializer(serializers.ModelSerializer):
    """Project Serializer"""

    labels = LabelTxtBase64File(write_only=True, required=False)

    def validate(self, value):
        """validate"""
        if "labels" in value:
            if "is_prediction_module" not in value or not value["is_prediction_module"]:
                raise serializers.ValidationError(
                    "Upload labels should check is_prediction_module"
                )
            if "prediction_uri" not in value or not value["prediction_uri"]:
                raise serializers.ValidationError(
                    "Upload labels should set prediction_uri"
                )
        return value

    def create(self, validated_data):
        labels = None
        if "labels" in validated_data:
            labels = validated_data.pop("labels")
        if labels:
            validated_data["is_prediction_module"] = True
            validated_data["is_demo"] = False
        project = Project.objects.create(**validated_data)

        if labels:
            label = labels.readline().decode().replace("\n", "").replace("\r", "")
            while label:
                Part.objects.create(project=project, name=label)
                label = labels.readline().decode().replace("\n", "").replace("\r", "")
        return project

    class Meta:
        model = Project
        fields = "__all__"
        extra_kwargs = {
            "download_uri": {"required": False},
            "customvision_id": {"required": False},
            "labels": {"write_only": True},
        }


class TaskSerializer(serializers.ModelSerializer):
    """TaskSerializer"""

    class Meta:
        model = Task
        fields = "__all__"


# pylint: disable=abstract-method
class IterationPerformanceSerializer(serializers.Serializer):
    """TrainPerformanceSerializer."""

    iteration_name = serializers.ChoiceField(choices=["new", "previous", "demo"])
    iteration_id = serializers.CharField(max_length=200)
    status = serializers.CharField(max_length=100)
    precision = serializers.FloatField(default=0.0)
    recall = serializers.FloatField(default=0.0)
    mAP = serializers.FloatField(default=0.0)


class ProjectPerformanesSerializer(serializers.Serializer):
    """ProjectPerformanesSerializer."""

    iterations = IterationPerformanceSerializer(many=True)

class CreateCVProjectSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    project_type = serializers.CharField(max_length=200)
    tags = serializers.ListField(child=serializers.CharField(max_length=200))