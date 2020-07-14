from rest_framework import serializers
from ..models import Feedback
from django.contrib.auth.models import User
import logging

logger = logging.getLogger(__name__)


class FeedbackSerializer(serializers.ModelSerializer):

    class Meta:
        model = Feedback
        fields = "__all__"
