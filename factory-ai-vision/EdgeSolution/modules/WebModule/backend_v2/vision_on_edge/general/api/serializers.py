# -*- coding: utf-8 -*-
"""App Serializers
"""

import logging

from rest_framework import serializers

logger = logging.getLogger(__name__)


# pylint: disable=abstract-method
class SimpleStatusSerializer(serializers.Serializer):
    """ExportSerializer.
    """
    status = serializers.ChoiceField(choices=["ok"])
