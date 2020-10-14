"""App utilites tests.
"""
import sys

import pytest
from django.apps import apps

from ..models import Location
from ..utils import create_demo_objects

pytestmark = pytest.mark.django_db


def test_create_demo_objects():
    """test_create_demo_objects."""
    create_demo_objects()
    assert Location.objects.count() >= 0


@pytest.mark.parametrize(
    "testargs, output",
    [
        [["python", "manage.py", "runserver"], 1],
        [["python", "manage.py", "makemigration"], 0],
        [["python", "manage.py", "migrate"], 0],
        [["python", "manage.py", "test"], 0],
        [["pytest"], 0],
    ],
)
def test_app(monkeypatch, testargs, output):
    """test_create_demo_objects."""
    print(testargs)
    monkeypatch.setattr(sys, "argv", testargs)
    app_config = apps.get_app_config("locations")
    app_config.ready()
    assert Location.objects.count() == output


@pytest.mark.parametrize(
    "testenv, output",
    [
        ["true", 1],
        ["True", 1],
        ["1", 1],
        ["false", 0],
        ["False", 0],
        ["0", 0],
        ["random_string", 1],
    ],
)
def test_app_not_create_demo(monkeypatch, testenv, output):
    """test_create_demo_objects."""
    monkeypatch.setenv("CREATE_DEMO", testenv)
    testargs = ["python", "manage.py", "runserver"]
    monkeypatch.setattr(sys, "argv", testargs)

    app_config = apps.get_app_config("locations")
    app_config.ready()
    assert Location.objects.count() == output
