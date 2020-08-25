# -*- coding: utf-8 -*-
"""App Serializers
"""

import logging

from rest_framework import serializers

from ..models import Project, Task

logger = logging.getLogger(__name__)


class ProjectSerializer(serializers.ModelSerializer):
    """Project Serializer"""

    class Meta:
        model = Project
        exclude = ['id']
        extra_kwargs = {
            "download_uri": {
                "required": False
            },
            "customvision_id": {
                "required": False
            },
        }

class TaskSerializer(serializers.ModelSerializer):
    """TaskSerializer"""

    class Meta:
        model = Task
        exclude = ['id']
