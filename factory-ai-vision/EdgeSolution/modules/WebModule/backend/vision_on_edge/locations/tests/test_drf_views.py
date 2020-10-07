"""App drf view tests.
"""

import json

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def test_create_1(location):
    """test_create_1

    Ensure we can created a location by rest api.
    """
    client = APIClient()
    url = reverse("api:location-list")

    # TODO: use serializer to generate data
    data = {"name": location.name + "New", "description": location.description}
    response = client.post(url, data, format="json").render()
    response_body = response.content

    assert response.status_code == status.HTTP_201_CREATED
    assert json.loads(response_body)["name"] == location.name + "New"
    assert json.loads(response_body)["description"] == location.description
