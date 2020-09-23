"""App model tests.
"""

import pytest

from .factories import PartFactory

pytestmark = pytest.mark.django_db


@pytest.mark.fast
def test_create_without_description():
    """
    Type:
        Positive

    Description:
        Try to create parts without description assigned.
        Description column is now not mandatory.
    """
    part = PartFactory()
    part.description = ""
    part.save()
    assert part.description == ""


@pytest.mark.fast
def test_project_id_and_part_name_unique_together():
    """
    Type:
        Positive

    Description:
        Try to create parts without description assigned.
        Description column is now not mandatory.
    """
    part1 = PartFactory()
    part1.name = "duplicate part"
    part1.save()
    part2 = PartFactory()
    part2.name = "duplicate part"
    part2.save()
    with pytest.raises(Exception):
        part2.project = part1.project
        part2.save()
