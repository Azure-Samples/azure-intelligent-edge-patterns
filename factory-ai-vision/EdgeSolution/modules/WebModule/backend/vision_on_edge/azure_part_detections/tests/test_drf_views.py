"""App drf view tests.
"""

import json

import pytest
from rest_framework import status
from rest_framework.test import APIRequestFactory

from ..api.serializers import PartDetectionSerializer, PDScenarioSerializer
from ..api.views import PartDetectionViewSet
from ..models import Project

pytestmark = pytest.mark.django_db


def test_get(part_detection):
    """test_get_queryset.

    Args:
        notification (Notification): notification
    """
    factory = APIRequestFactory()
    pd_list_view = PartDetectionViewSet.as_view({"get": "list"})
    request = factory.get("/fake-url/")

    response = pd_list_view(request).render()
    response_body = response.content.decode("utf-8")

    assert PartDetectionSerializer(part_detection).data in json.loads(response_body)
