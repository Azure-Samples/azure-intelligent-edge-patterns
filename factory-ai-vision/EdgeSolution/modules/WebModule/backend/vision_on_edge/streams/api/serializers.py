"""App serializers.
"""

import logging

from rest_framework import serializers

from ...images.api.serializers import ImageSerializer

logger = logging.getLogger(__name__)

# pylint: disable=abstract-method


class StreamConnectResponseSerializer(serializers.Serializer):
    """ProjectPerformanesSerializer."""

    status = serializers.ChoiceField(choices=["ok"])
    stream_id = serializers.IntegerField()


class StreamCaptureResponseSerializer(serializers.Serializer):
    """StreamCaptureResponseSerializer."""

    class CapturedImageSerializer(ImageSerializer):
        """CapturedImageSerializer."""

        image = serializers.CharField()

    status = serializers.ChoiceField(choices=["ok"])
    image = CapturedImageSerializer()
