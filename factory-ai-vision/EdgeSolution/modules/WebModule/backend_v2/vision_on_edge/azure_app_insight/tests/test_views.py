# -*- coding: utf-8 -*-
"""App API view tests.
"""

import logging

from configs.app_insight import APP_INSIGHT_INST_KEY
from rest_framework import status
from rest_framework.test import APIRequestFactory

from ..api.serializers import InstrumentKeyResponseSerializer
from ..api.views import key_view

logger = logging.getLogger(__name__)


def test_can_get_key():
    """test_can_get_key.
    """
    factory = APIRequestFactory()
    request = factory.get("5566")
    response = key_view(request)
    assert response.status_code == status.HTTP_200_OK
    serializer = InstrumentKeyResponseSerializer(data=response.data)
    assert serializer.is_valid()
    assert serializer.validated_data["key"] == APP_INSIGHT_INST_KEY
