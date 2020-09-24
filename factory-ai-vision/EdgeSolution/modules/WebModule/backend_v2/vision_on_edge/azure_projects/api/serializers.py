"""App serializers.
"""

import logging

from rest_framework import serializers

from ..models import Project, Task

logger = logging.getLogger(__name__)


class ProjectSerializer(serializers.ModelSerializer):
    """Project Serializer"""

    class Meta:
        model = Project
        fields = "__all__"
        extra_kwargs = {
            "download_uri": {"required": False},
            "customvision_id": {"required": False},
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
