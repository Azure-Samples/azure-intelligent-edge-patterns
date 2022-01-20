"""App API view tests.
"""

from unittest import mock

import pytest
from rest_framework import status
from rest_framework.test import APIRequestFactory

from ..api.serializers import InstrumentKeyResponseSerializer
from ..api.views import key_view

FAKE_KEY = "fake_key"


@pytest.mark.fast
@mock.patch("vision_on_edge.azure_app_insight.api.views.APP_INSIGHT_INST_KEY", FAKE_KEY)
def test_can_get_key():
    """test_can_get_key."""
    factory = APIRequestFactory()
    request = factory.get("5566")
    response = key_view(request)
    response.render()
    assert response.status_code == status.HTTP_200_OK
    serializer = InstrumentKeyResponseSerializer(data=response.data)
    assert serializer.is_valid()
    assert serializer.validated_data["key"] == FAKE_KEY
