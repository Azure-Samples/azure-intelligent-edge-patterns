"""App API serializers.
"""

import logging

from rest_framework import serializers

from ..models import Feedback

logger = logging.getLogger(__name__)


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = "__all__"
