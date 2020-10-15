"""App utilites tests.
"""
import sys

import pytest
from django.apps import apps

from ..models import Camera

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize(
    "testargs, output",
    [
        [["python", "manage.py", "runserver"], 4],
        [["python", "manage.py", "makemigration"], 0],
        [["python", "manage.py", "migrate"], 0],
        [["python", "manage.py", "test"], 0],
        [["pytest"], 0],
    ],
)
def test_app(monkeypatch, testargs, output):
    """test_create_demo_objects."""
    monkeypatch.setattr(sys, "argv", testargs)
    app_config = apps.get_app_config("locations")
    app_config.ready()
    app_config = apps.get_app_config("cameras")
    app_config.ready()
    assert Camera.objects.count() == output


@pytest.mark.parametrize(
    "testenv, output",
    [
        ["true", 4],
        ["True", 4],
        ["1", 4],
        ["false", 0],
        ["False", 0],
        ["0", 0],
        ["random_string", 4],
    ],
)
def test_app_not_create_demo(monkeypatch, testenv, output):
    """test_create_demo_objects."""
    monkeypatch.setenv("CREATE_DEMO", testenv)
    testargs = ["python", "manage.py", "runserver"]
    monkeypatch.setattr(sys, "argv", testargs)

    app_config = apps.get_app_config("locations")
    app_config.ready()
    app_config = apps.get_app_config("cameras")
    app_config.ready()
    assert Camera.objects.count() == output
