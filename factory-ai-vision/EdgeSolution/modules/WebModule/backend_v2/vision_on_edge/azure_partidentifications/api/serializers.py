"""
Azure Training Serializers
"""

import logging

from rest_framework import serializers

from ...azure_settings.models import Setting
from ..models import Project, Task

logger = logging.getLogger(__name__)


class ProjectSerializer(serializers.ModelSerializer):
    """Project Serializer"""

    class Meta:
        model = Project
        fields = '__all__'
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

class TaskSerializer(serializers.ModelSerializer):
    """TaskSerializer"""

    class Meta:
        model = Task
        fields = '__all__'
