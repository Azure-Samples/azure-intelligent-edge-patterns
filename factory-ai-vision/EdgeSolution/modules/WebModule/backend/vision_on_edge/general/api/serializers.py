"""App serializers.
"""

import logging

from rest_framework import serializers

logger = logging.getLogger(__name__)


# pylint: disable=abstract-method
class SimpleOKSerializer(serializers.Serializer):
    """SimpleOKSerializer."""

    status = serializers.ChoiceField(choices=["ok"])


class MSStyleErrorResponseSerializer(serializers.Serializer):
    """MSStyleErrorResponseSerializer.

    MicroSoft Style Inner Error Serializer.
    """

    class MSStyleErrorSerializer(serializers.Serializer):
        """MSStyleErrorSerializer.

        MicroSoft Style Error Response Serializer.
        """

        status_code = serializers.IntegerField()
        code = serializers.CharField()
        message = serializers.CharField()

    error = MSStyleErrorSerializer()
