"""App Serializer
"""

from rest_framework import serializers


class UploadRelabelSerializer(serializers.Serializer):
    """UploadRelabelSerializer."""

    part_name = serializers.CharField()
    labels = serializers.CharField()
    img = serializers.ImageField(required=True)
    confidence = serializers.IntegerField()
    rtsp = serializers.CharField()
