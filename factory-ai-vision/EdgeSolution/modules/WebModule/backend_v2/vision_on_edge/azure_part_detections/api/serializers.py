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
