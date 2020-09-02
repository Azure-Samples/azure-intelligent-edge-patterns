# -*- coding: utf-8 -*-
"""App serializers.
"""

import logging

from rest_framework import serializers
from ...images.api.serializers import ImageSerializer

logger = logging.getLogger(__name__)


class ConnectStreamResponseSerializer(serializers.Serializer):
    """ProjectPerformanesSerializer.
    """
    status = serializers.ChoiceField(choices=['ok'])
    stream_id = serializers.IntegerField()

class CaptureStreamResponseSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['ok'])
    image = ImageSerializer()
