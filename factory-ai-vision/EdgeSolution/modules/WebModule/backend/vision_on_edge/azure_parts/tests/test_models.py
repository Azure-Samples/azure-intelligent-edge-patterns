"""App model tests.
"""

import pytest

from ...images.models import Image
from ..constants import CUSTOMVISION_LEAST_IMAGE_TO_TRAIN
from ..exceptions import PartNotEnoughImagesToTrain
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


@pytest.mark.fast
def test_part_is_trainable(part):
    assert not part.is_trainable()
    with pytest.raises(PartNotEnoughImagesToTrain):
        assert not part.is_trainable(raise_exception=True)


@pytest.mark.fast
def test_part_is_trainable_2(part):
    for _ in range(CUSTOMVISION_LEAST_IMAGE_TO_TRAIN):
        Image.objects.create(part=part, manual_checked=True)
    assert part.is_trainable()
    assert part.is_trainable(raise_exception=True)


@pytest.mark.fast
def test_part_is_trainable_3(part):
    for _ in range(CUSTOMVISION_LEAST_IMAGE_TO_TRAIN):
        Image.objects.create(part=part, manual_checked=False)
    assert not part.is_trainable()
    with pytest.raises(PartNotEnoughImagesToTrain):
        assert part.is_trainable(raise_exception=True)


@pytest.mark.fast
def test_part_is_trainable_4(part, monkeypatch):
    images_on_cloud = 5
    for _ in range(CUSTOMVISION_LEAST_IMAGE_TO_TRAIN - images_on_cloud):
        Image.objects.create(part=part, manual_checked=True)
    assert not part.is_trainable()
    with pytest.raises(PartNotEnoughImagesToTrain):
        assert not part.is_trainable(raise_exception=True)

    def mock_get_tagged_images_count_just_enough(*args, **kwargs):
        return images_on_cloud

    monkeypatch.setattr(
        part, "get_tagged_images_count_remote", mock_get_tagged_images_count_just_enough
    )
    assert part.is_trainable()
    assert part.is_trainable(raise_exception=True)


@pytest.mark.fast
def test_part_is_trainable_5(part, monkeypatch):
    images_on_cloud = 5
    for _ in range(CUSTOMVISION_LEAST_IMAGE_TO_TRAIN - images_on_cloud):
        Image.objects.create(part=part, manual_checked=True)
    assert not part.is_trainable()
    with pytest.raises(PartNotEnoughImagesToTrain):
        assert not part.is_trainable(raise_exception=True)

    def mock_get_tagged_images_count_not_enough(*args, **kwargs):
        return images_on_cloud - 1

    monkeypatch.setattr(
        part, "get_tagged_images_count_remote", mock_get_tagged_images_count_not_enough
    )
    assert not part.is_trainable()
    with pytest.raises(PartNotEnoughImagesToTrain):
        assert not part.is_trainable(raise_exception=True)
