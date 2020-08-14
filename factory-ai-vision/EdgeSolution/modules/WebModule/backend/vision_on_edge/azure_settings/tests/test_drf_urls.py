"""DRF url tests
"""

import pytest
from django.urls import resolve, reverse

from vision_on_edge.azure_settings.models import Setting

pytestmark = pytest.mark.django_db


def test_setting_detail(setting: Setting):
    """test_setting_detail.

    Args:
        setting (Setting): setting
    """

    assert (reverse("api:setting-detail",
                    kwargs={"pk": setting.id
                           }) == f"/api/settings/{setting.id}")
    assert resolve(
        f"/api/settings/{setting.id}").view_name == "api:setting-detail"


def test_setting_list():
    """test_setting_list.
    """
    assert reverse("api:setting-list") == "/api/settings"
    assert resolve("/api/settings").view_name == "api:setting-list"
