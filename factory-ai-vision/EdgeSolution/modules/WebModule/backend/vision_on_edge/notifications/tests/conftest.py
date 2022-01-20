"""Conftest
"""

import pytest

from ..models import Notification
from ..tests.factories import NotificationFactory


@pytest.fixture
def notification() -> Notification:
    """notification.

    Args:

    Returns:
        Notification:
    """
    return NotificationFactory()
