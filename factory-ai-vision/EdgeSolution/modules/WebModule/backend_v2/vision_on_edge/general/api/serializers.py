# -*- coding: utf-8 -*-
"""App serializers.
"""

import logging

from rest_framework import serializers

logger = logging.getLogger(__name__)


# pylint: disable=abstract-method
class SimpleStatusSerializer(serializers.Serializer):
    """SimpleStatusSerializer.
    """
    status = serializers.ChoiceField(choices=["ok"])


class SimpleErrorSerializer(serializers.Serializer):
    """SimpleErrorSerializer.
    """
    status = serializers.ChoiceField(choices=["error"])
    log = serializers.CharField()


class MSStyleErrorSerializer(serializers.Serializer):
    """MSStyleErrorSerializer.

    MicroSoft Style Error Response Serializer.
    """
    status_code = serializers.IntegerField()
    code = serializers.CharField()
    message = serializers.CharField()


class MSStyleErrorResponseSerializer(serializers.Serializer):
    """MSStyleErrorResponseSerializer.

    MicroSoft Style Inner Error Serializer.
    """
    error = MSStyleErrorSerializer()
