# -*- coding: utf-8 -*-
"""App utility tests.
"""

from unittest import mock

from ..utils import is_edge, inference_module_url


@mock.patch("vision_on_edge.azure_iot.utils.IoTHubModuleClient",
            mock.MagicMock(return_value=None))
def test_is_edge_true():
    """test_is_edge.
    """
    assert is_edge()


def test_is_edge_false():
    """test_is_edge.
    """
    assert not is_edge()


@mock.patch("vision_on_edge.azure_iot.utils.IoTHubModuleClient",
            mock.MagicMock(return_value=None))
def test_inference_module_on_edge():
    """test_inference_module_on_edge.
    """
    assert inference_module_url() == "172.18.0.1:5000"


def test_inference_module_not_on_edge():
    """test_inference_module_not_on_edge.
    """
    assert inference_module_url() == "localhost:5000"
