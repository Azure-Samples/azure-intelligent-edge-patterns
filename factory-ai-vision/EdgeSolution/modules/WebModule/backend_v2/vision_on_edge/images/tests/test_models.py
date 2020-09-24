"""App model tests.
"""

import pytest

from ..models import Image

pytestmark = pytest.mark.django_db


def test_delete_relable_if_acc_range_change(project, part):
    """test_delete_relable_if_acc_range_change.

    If Project relabel accuracy range change, delete all relabel images.
    """

    for _ in range(40):
        Image.objects.create(project=project, part=part, is_relabel=True)

    assert Image.objects.all().count() == 40

    project.has_configured = True
    project.accuracyRangeMin += 1
    project.accuracyRangeMax -= 1
    project.save()
    assert Image.objects.all().count() == 0


def test_delete_relable_if_acc_range_min_change(project, part):
    """test_delete_relable_if_acc_range_min_change.

    If Project relabel accuracyRangeMin change, delete all
    relabel image
    """
    for _ in range(40):
        Image.objects.create(project=project, part=part, is_relabel=True)

    assert Image.objects.all().count() == 40

    project.has_configured = True
    project.accuracyRangeMin += 1
    project.save()
    assert Image.objects.all().count() == 0


def test_delete_relable_if_acc_range_max_change(project, part):
    """test_delete_relable_if_acc_range_max_change.

    If Project relabel accuracyRangeMax change, delete all
    relabel image
    """
    for _ in range(40):
        Image.objects.create(project=project, part=part, is_relabel=True)

    assert Image.objects.all().count() == 40

    project.has_configured = True
    project.accuracyRangeMax -= 1
    project.save()
    assert Image.objects.all().count() == 0


def test_not_delete_relabel_if_acc_range_not_change(project, part):
    """test_not_delete_relabel_if_acc_range_not_change.

    If Project relabel accuracy range not change,
    keep all relabel images.
    """

    for _ in range(40):
        Image.objects.create(project=project, part=part, is_relabel=True)

    assert Image.objects.all().count() == 40

    project.has_configured = True
    project.accuracyRangeMax -= 1
    project.save()
    assert Image.objects.all().count() == 0
