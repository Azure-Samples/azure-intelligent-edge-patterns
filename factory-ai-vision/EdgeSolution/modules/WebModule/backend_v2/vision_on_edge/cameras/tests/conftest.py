"""Conftest
"""

from unittest import mock

import pytest

from ..models import Camera


@pytest.fixture(scope="function", autouse=True)
def mock_validate(monkeypatch):
    monkeypatch.setattr(Camera, "verify_rtsp", mock.MagicMock(return_value=True))
