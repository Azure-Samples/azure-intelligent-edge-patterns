"""DRF url tests
"""

import pytest
from django.urls import resolve, reverse

from ..models import Notification

pytestmark = pytest.mark.django_db


def test_notification_detail(notification: Notification):
    """test_notification_detail.

    Args:
        notification (Notification): notification
    """

    assert (
        reverse("api:notification-detail", kwargs={"pk": notification.id})
        == f"/api/notifications/{notification.id}"
    )
    assert (
        resolve(f"/api/notifications/{notification.id}").view_name
        == "api:notification-detail"
    )


def test_notification_list():
    """test_notification_list."""
    assert reverse("api:notification-list") == "/api/notifications"
    assert resolve("/api/notifications").view_name == "api:notification-list"


def test_notification_delete_all():
    """test_notification_delete_all."""
    assert reverse("api:notification-delete-all") == "/api/notifications/delete_all"
    assert (
        resolve("/api/notifications/delete_all").view_name
        == "api:notification-delete-all"
    )
