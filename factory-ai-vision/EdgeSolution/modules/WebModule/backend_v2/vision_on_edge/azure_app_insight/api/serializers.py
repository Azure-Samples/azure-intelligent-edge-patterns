"""App API serializers.
"""

from rest_framework import serializers


# pylint: disable=abstract-method
class InstrumentKeyResponseSerializer(serializers.Serializer):
    """InstrumentKeyResponseSerializer."""

    status = serializers.ChoiceField(choices=["ok"])
    key = serializers.CharField()
