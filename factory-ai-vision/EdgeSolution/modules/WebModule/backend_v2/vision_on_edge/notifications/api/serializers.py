# -*- coding: utf-8 -*-
"""App Serializers
"""

import logging

from rest_framework import serializers

from ..models import Notification

logger = logging.getLogger(__name__)


class NotificationSerializer(serializers.ModelSerializer):
    """NotificationSerializer"""

    class Meta:
        model = Notification
        exclude = ['id']
        extra_kwargs = {
            "timestamp": {
                "required": False
            },
        }
