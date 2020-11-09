"""Conftest
"""

from unittest import mock

import pytest

from ...azure_settings.models import Setting
from ...cameras.models import Camera

pytestmark = pytest.mark.django_db


@pytest.fixture(scope="function", autouse=True)
def mock_validate(monkeypatch):
    monkeypatch.setattr(Setting, "validate", mock.MagicMock(return_value=True))


@pytest.fixture(scope="function", autouse=True)
def mock_get_domain_id(monkeypatch):
    monkeypatch.setattr(
        Setting, "get_domain_id", mock.MagicMock(return_value="Fake_id")
    )


# @pytest.fixture(scope="module")
# def mock_validate(monkeypatch):
# class FakeProject:
# def __init__(self):
# self.name = "Fake Project"

# monkeypatch.setattr(Setting, "validate", True)
