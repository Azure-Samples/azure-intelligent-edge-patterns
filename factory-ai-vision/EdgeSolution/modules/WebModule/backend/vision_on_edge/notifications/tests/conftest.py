"""Conftest
"""

import pytest

from vision_on_edge.notifications.models import Notification
from vision_on_edge.notifications.tests.factories import NotificationFactory


@pytest.fixture
def notification() -> Notification:
    """notification.

    Args:

    Returns:
        Notification:
    """
    return NotificationFactory()
