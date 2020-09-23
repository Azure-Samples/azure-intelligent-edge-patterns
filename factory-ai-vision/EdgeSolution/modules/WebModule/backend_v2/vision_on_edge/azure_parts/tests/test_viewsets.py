"""App viewset tests.
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
def test_create_part():
    """test_create_part.

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
def test_create_dup_parts():
    """test_create_part.

    Ensure APIClient can create a duplicate part get expected error response.
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


# def test_create_dup_parts():
# """
# Type:
# Negative

# Description:
# Ensure create duplicate Part objects will failed.

# Expected Results:
# 400 { 'status': 'failed', 'log': 'xxx'}
# """
# client = APIClient()
# url = reverse("api:part-list")
# part_name = "Part1"
# part_desb = "Unittest Part1 Description"

# # Request
# data = {"name": part_name, "description": part_desb}
# response = client.post(url, data, format="json")

# # Check
# assert response.status_code == status.HTTP_400_BAD_REQUEST
# assert json.loads(response.content)["status"] == "failed"
# assert json.loads(response.content)["log"] == ""

# def test_create_same_lowercase_parts():
# """test_create_same_lowercase_parts.

# Type:
# Negative

# Description:
# Ensure Part name ==  is_demo is unique together.

# Expected Results
# 400 { 'status': 'failed', 'log': 'xxx' }
# """
# # Random Case
# client = APIClient()
# url = reverse("api:part-list")

# # Request
# data = {"name": "pArT1", "description": "New Description"}
# response = client.post(url, data, format="json")

# # Check
# assert response.status_code == status.HTTP_400_BAD_REQUEST
# assert json.loads(response.content)["status"] == "failed"
# assert json.loads(response.content)["log"] == ""

# # All upper case
# # Request
# data = {"name": "PART2", "description": "New Description"}
# response = client.post(url, data, format="json")

# # Check
# assert response.status_code == status.HTTP_400_BAD_REQUEST
# assert json.loads(response.content)["status"] == "failed"
# assert json.loads(response.content)["log"] == ""

# # All lowercase
# # Request
# data = {"name": "part3", "description": "New Description"}
# response = client.post(url, data, format="json")

# # Check
# assert response.status_code == status.HTTP_400_BAD_REQUEST
# assert json.loads(response.content)["status"] == "failed"
# assert json.loads(response.content)["log"] == ""

# def test_create_no_desb_parts():
# """test_create_no_desb_parts.

# Type:
# Positive

# Description:
# Create a part without description assigned.
# Description column is not mandatory.

# Expected Results:
# 201 { 'name': 'part_name', 'description': 'xxx' }
# """
# # Var
# client = APIClient()
# url = reverse("api:part-list")
# default_desb = ""

# # Request
# part_name = "nEw_pArT1"
# data = {"name": part_name}
# response = client.post(url, data, format="json")

# # Check
# assert response.status_code == status.HTTP_201_CREATED
# assert json.loads(response.content)["name"] == part_name
# assert json.loads(response.content)["description"] == default_desb

# # Request
# part_name = "NEW_PART2"
# data = {"name": part_name}
# response = client.post(url, data, format="json")

# # Check
# assert response.status_code == status.HTTP_201_CREATED
# assert json.loads(response.content)["name"] == part_name
# assert json.loads(response.content)["description"] == default_desb

# def test_create_demo_parts_with_same_name():
# """test_create_demo_parts_with_same_name.

# Type:
# Negative

# Description:
# Create demo part and none-demo part with same name.
# Should pass.

# Expected Results:
# pass
# """
# client = APIClient()
# url = reverse("api:part-list")
# data = {"name": "Part1", "description": "Desb1", "is_demo": True}
# response = client.post(url, data, format="json")
# assert response.status_code == status.HTTP_201_CREATED

# data = {"name": "Part2", "description": "Desb1", "is_demo": True}
# response = client.post(url, data, format="json")
# assert response.status_code == status.HTTP_201_CREATED

# data = {"name": "DemoPart1", "description": "Desb1"}
# response = client.post(url, data, format="json")
# assert response.status_code == status.HTTP_201_CREATED

# data = {"name": "DemoPart2", "description": "Desb1"}
# response = client.post(url, data, format="json")
# assert response.status_code == status.HTTP_201_CREATED

# def test_create_demo_parts_with_same_name_2():
# """test_create_demo_parts_with_same_name_2.

# Type:
# Positive

# Description:
# Create parts with same name.

# Expected Results:
# Failed.
# """
# client = APIClient()
# url = reverse("api:part-list")
# data = {"name": "Part1", "description": "Desb1", "is_demo": False}
# response = client.post(url, data, format="json")
# assert response.status_code == status.HTTP_400_BAD_REQUEST

# data = {"name": "Part2", "description": "Desb1"}
# response = client.post(url, data, format="json")
# assert response.status_code == status.HTTP_400_BAD_REQUEST

# data = {"name": "DemoPart1", "description": "Desb1", "is_demo": True}
# response = client.post(url, data, format="json")
# assert response.status_code == status.HTTP_400_BAD_REQUEST

# data = {"name": "DemoPart2", "description": "Desb1", "is_demo": True}
# response = client.post(url, data, format="json")
# assert response.status_code == status.HTTP_400_BAD_REQUEST

# def test_put():
# """test_put.

# Type:
# Positive

# Description:
# Test update is ok.

# Expected Results:
# 200 OK
# """
# # New description
# client = APIClient()
# url = reverse("api:part-list")
# response = client.get(url)
# for part in response.data:
# if part["name"] == "Part2":
# part2_id = part["id"]
# if part["name"] == "Part1":
# part1_id = part["id"]
# data = {"name": "New Part Name", "description": "New Description"}
# url = reverse("api:part-detail", kwargs={"pk": part1_id})
# response = client.post(url, data, format="json")
# assert response.status_code == status.HTTP_200_OK

# data = {"name": "DemoPart1", "description": "New Description"}
# url = reverse("api:part-detail", kwargs={"pk": part2_id})
# response = client.post(url, data, format="json")
# assert response.status_code == status.HTTP_200_OK
