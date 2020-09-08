# -*- coding: utf-8 -*-
"""App model tests.
"""

import logging
from unittest import mock

import pytest

from ..models import Setting

logger = logging.getLogger(__name__)

pytestmark = pytest.mark.django_db


@mock.patch("vision_on_edge.azure_settings.api.views.Setting.validate",
            mock.MagicMock(return_value=True))
@mock.patch("vision_on_edge.azure_settings.api.views.Setting.get_domain_id",
            mock.MagicMock(return_value="Fake_id"))
def test_valid_setting(setting: Setting):
    """
    Type:
        Positive

    Description:
        Setting pre_save should validate the (ENDPOINT, TRAINING_KEY)
        'is_trainer_valid' should be updated.
    """
    setting.save()
    assert setting.is_trainer_valid
    assert setting.obj_detection_domain_id == "Fake_id"


@mock.patch("vision_on_edge.azure_settings.api.views.Setting.validate",
            mock.MagicMock(return_value=False))
@mock.patch("vision_on_edge.azure_settings.api.views.Setting.get_domain_id",
            mock.MagicMock(return_value="Fake_id"))
def test_invalid_setting(setting: Setting):
    """
    Type:
        Negative

    Description:
        Setting pre_save should validate the (ENDPOINT, TRAINING_KEY)
        'is_trainer_valid' should be updated.
    """
    setting.save()
    assert not setting.is_trainer_valid
    assert setting.obj_detection_domain_id == ""
