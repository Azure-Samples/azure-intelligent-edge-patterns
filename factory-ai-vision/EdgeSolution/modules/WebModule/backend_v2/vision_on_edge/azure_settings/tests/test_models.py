"""App model tests.
"""

import logging
from unittest import mock

import pytest

from .factories import SettingFactory

logger = logging.getLogger(__name__)

pytestmark = pytest.mark.django_db


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.validate",
    mock.MagicMock(return_value=True),
)
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.get_domain_id",
    mock.MagicMock(return_value="Fake_id"),
)
def test_valid_setting():
    """
    Type:
        Positive

    Description:
        Setting pre_save should validate the (ENDPOINT, TRAINING_KEY)
        'is_trainer_valid' should be updated.
    """
    setting = SettingFactory()
    setting.save()
    assert setting.is_trainer_valid
    assert setting.obj_detection_domain_id == "Fake_id"


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_settings.api.views.Setting.validate",
    mock.MagicMock(return_value=False),
)
@mock.patch(
    "vision_on_edge.azure_settings.api.views.Setting.get_domain_id",
    mock.MagicMock(return_value="Fake_id"),
)
def test_invalid_setting():
    """
    Type:
        Negative

    Description:
        Setting pre_save should validate the (ENDPOINT, TRAINING_KEY)
        'is_trainer_valid' should be updated.
    """
    setting = SettingFactory()
    setting.save()
    assert not setting.is_trainer_valid
    assert setting.obj_detection_domain_id == ""
