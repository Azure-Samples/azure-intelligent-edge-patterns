"""App model tests.
"""

import pytest

from ...azure_part_detections.models import PartDetection
from ..models import Image

pytestmark = pytest.mark.django_db


def test_delete_relabel_if_acc_range_change(project, part):
    """test_delete_relabel_if_acc_range_change.

    If Project relabel accuracy range change, delete all relabel images.
    """

    part_detection = PartDetection.objects.create(project=project)
    part_detection.parts.add(part)
    part_detection.save()

    for _ in range(40):
        Image.objects.create(project=project, part=part, is_relabel=True)

    assert Image.objects.all().count() == 40

    part_detection.has_configured = True
    part_detection.accuracyRangeMin += 1
    part_detection.accuracyRangeMax -= 1
    part_detection.save()
    assert Image.objects.all().count() == 0


def test_delete_relabel_if_acc_range_min_change(project, part):
    """test_delete_relabel_if_acc_range_min_change.

    If Project relabel accuracyRangeMin change, delete all
    relabel image
    """
    part_detection = PartDetection.objects.create(project=project)
    part_detection.parts.add(part)
    part_detection.save()

    for _ in range(40):
        Image.objects.create(project=project, part=part, is_relabel=True)

    assert Image.objects.all().count() == 40

    part_detection.has_configured = True
    part_detection.accuracyRangeMin += 1
    part_detection.save()
    assert Image.objects.all().count() == 0


def test_delete_relabel_if_acc_range_max_change(project, part):
    """test_delete_relabel_if_acc_range_max_change.

    If Project relabel accuracyRangeMax change, delete all
    relabel image
    """
    part_detection = PartDetection.objects.create(project=project)
    part_detection.parts.add(part)
    part_detection.save()

    for _ in range(40):
        Image.objects.create(project=project, part=part, is_relabel=True)

    assert Image.objects.all().count() == 40

    part_detection.has_configured = True
    part_detection.accuracyRangeMax -= 1
    part_detection.save()
    assert Image.objects.all().count() == 0


def test_not_delete_relabel_if_acc_range_not_change(project, part):
    """test_not_delete_relabel_if_acc_range_not_change.

    If Project relabel accuracy range not change,
    keep all relabel images.
    """

    part_detection = PartDetection.objects.create(project=project)
    part_detection.parts.add(part)
    part_detection.save()

    for _ in range(40):
        Image.objects.create(project=project, part=part, is_relabel=True)

    assert Image.objects.all().count() == 40

    part_detection.has_configured = True
    part_detection.accuracyRangeMax -= 1
    part_detection.save()
    assert Image.objects.all().count() == 0
