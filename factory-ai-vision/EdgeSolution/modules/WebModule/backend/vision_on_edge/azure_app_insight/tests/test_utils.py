"""App utility tests.
"""

import logging

import pytest
from opencensus.ext.azure.log_exporter import AzureLogHandler

from ..utils import get_app_insight_logger


@pytest.mark.fast
def test_get_app_insight_logger():
    """test_get_app_insight_logger."""
    az_logger = get_app_insight_logger()

    assert isinstance(az_logger, logging.Logger)
    assert len(az_logger.handlers) == 1
    assert isinstance(az_logger.handlers[0], AzureLogHandler)
