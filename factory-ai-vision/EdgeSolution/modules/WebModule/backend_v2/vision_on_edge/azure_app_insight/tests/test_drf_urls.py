# -*- coding: utf-8 -*-
"""App drf url tests.
"""

from django.urls import resolve, reverse


def test_key_view():
    """test_key_view.
    """
    assert resolve("/api/appinsight/key").view_name == "api:app_insight:key"
    assert reverse("api:app_insight:key") == "/api/appinsight/key"
