"""App drf view tests.
"""

import json

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from ...general.api.serializers import MSStyleErrorResponseSerializer
from ..models import Part
from .factories import PartFactory

pytestmark = pytest.mark.django_db


@pytest.mark.fast
def test_create_1():
    """test_create_1.

    Ensure APIClient can create a new part.
    """
    client = APIClient()
    part = PartFactory()
    url = reverse("api:part-list")

    data = {
        "project": part.project.id,
        "name": part.name + "New",
        "description": part.description,
    }
    response = client.post(url, data, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert json.loads(response.content)["id"]
    assert json.loads(response.content)["name"] == part.name + "New"
    assert json.loads(response.content)["description"] == part.description
    assert (
        Part.objects.get(pk=json.loads(response.content)["id"]).name
        == part.name + "New"
    )


@pytest.mark.fast
def test_create_duplcate_1():
    """test_create_duplcate_1.

    Ensure APIClient cannot create duplicate part within same project.
    Ensure error response has expected format.
    """
    client = APIClient()
    part = PartFactory()
    url = reverse("api:part-list")

    data = {
        "project": part.project.id,
        "name": part.name,
        "description": part.description + "New",
    }
    response = client.post(url, data, format="json")
    body = response.content

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert MSStyleErrorResponseSerializer(data=json.loads(body)).is_valid()


def test_put_1():
    """test_put.

    Ensure put will also make name check.
    """
    # New description
    part1 = PartFactory()
    part2 = PartFactory()
    part2.project = part1.project
    part2.save()

    client = APIClient()
    url = reverse("api:part-list")
    url = reverse("api:part-detail", kwargs={"pk": part2.id})

    # TODO: Use serializers to generate data
    data = {
        "project": part1.project.id,
        "name": part1.name,
        "description": part1.description,
    }
    response = client.put(url, data, format="json").render()
    response_body = response.content

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert MSStyleErrorResponseSerializer(data=json.loads(response_body)).is_valid()


def test_put_2():
    """test_put.

    Ensure put will also make name check.
    """
    # New description
    part1 = PartFactory()
    part2 = PartFactory()
    part2.project = part1.project
    part2.save()

    client = APIClient()
    url = reverse("api:part-list")
    url = reverse("api:part-detail", kwargs={"pk": part2.id})

    # TODO: Use serializers to generate data
    data = {
        "project": part1.project.id,
        "name": str(part1.name).upper(),
        "description": part1.description,
    }
    response = client.put(url, data, format="json").render()
    response_body = response.content

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert MSStyleErrorResponseSerializer(data=json.loads(response_body)).is_valid()
