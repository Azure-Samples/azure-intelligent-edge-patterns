"""App drf url tests.
"""

import pytest
from django.urls import resolve, reverse

from .factories import SettingFactory

pytestmark = pytest.mark.django_db


@pytest.mark.fast
def test_setting_detail():
    """test_setting_detail.

    Args:
        setting (Setting): setting
    """

    setting = SettingFactory()
    setting.save()
    assert (
        reverse("api:setting-detail", kwargs={"pk": setting.id})
        == f"/api/settings/{setting.id}"
    )
    assert resolve(f"/api/settings/{setting.id}").view_name == "api:setting-detail"


@pytest.mark.fast
def test_setting_list():
    """test_setting_list."""
    assert reverse("api:setting-list") == "/api/settings"
    assert resolve("/api/settings").view_name == "api:setting-list"
