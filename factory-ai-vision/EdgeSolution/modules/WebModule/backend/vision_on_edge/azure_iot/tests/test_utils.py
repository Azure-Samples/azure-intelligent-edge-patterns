"""App utility tests.
"""
from unittest import mock

import pytest

from ..utils import inference_module_url, is_edge


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_iot.utils.IoTHubModuleClient",
    mock.MagicMock(return_value=None),
)
def test_is_edge_true():
    """test_is_edge."""
    assert is_edge()


def test_is_edge_false():
    """test_is_edge."""
    assert not is_edge()


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_iot.utils.IoTHubModuleClient",
    mock.MagicMock(return_value=None),
)
def test_inference_module_on_edge():
    """test_inference_module_on_edge."""
    assert inference_module_url() == "inferencemodule:5000"


def test_inference_module_not_on_edge():
    """test_inference_module_not_on_edge."""
    assert inference_module_url() == "localhost:5000"
