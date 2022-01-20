"""Conftest
"""

from unittest import mock

import pytest

from ...azure_projects.models import Project
from ...azure_settings.models import Setting


@pytest.fixture(scope="function", autouse=True)
def mock_validate(monkeypatch):
    monkeypatch.setattr(Setting, "validate", mock.MagicMock(return_value=True))
    monkeypatch.setattr(
        Setting, "get_domain_id", mock.MagicMock(return_value="Fake_id")
    )

    class FakeProject:
        def __init__(self):
            self.name = "Fake Project"

    fake_project = FakeProject()
    monkeypatch.setattr(
        Project, "get_project_obj", mock.MagicMock(return_value=fake_project)
    )
    monkeypatch.setattr(Project, "validate", mock.MagicMock(return_value=True))
