"""App utilites tests.
"""
from unittest import mock

import cv2
import pytest

from ..utils import is_valid_rtsp, normalize_rtsp, verify_rtsp


@pytest.mark.parametrize(
    "rtsp_str, output",
    [
        [0, True],
        ["0", True],
        [1, True],
        ["1", True],
        [2, False],
        ["2", False],
        ["RTSP://QQ", True],
        ["rtsp://QQ", True],
        ["rTsP://QQ", True],
        ["@@rtsp://QQ", False],
        ["rtp://QQ", False],
        ["http://www.google.com", False],
    ],
)
def test_is_valid_rtsp(rtsp_str, output):
    """test_create_demo_objects."""
    assert is_valid_rtsp(rtsp_str) == output


@pytest.mark.parametrize(
    "input_str, output",
    [
        ("rtsp", "rtsp"),
        ("RTSP", "rtsp"),
        ("RtSp", "rtsp"),
        ("RTSP://RTSP", "rtsp://RTSP"),
        (0, 0),
        ("0", 0),
        (1, 1),
        ("1", 1),
        ("rtsp://google.com", "rtsp://google.com"),
        ("RTSP://google.com/RTSP", "rtsp://google.com/RTSP"),
    ],
)
def test_normalize_rtsp(input_str, output):
    """test_normalize_rtsp."""
    assert normalize_rtsp(input_str) == output


@pytest.mark.parametrize(
    "rtsp, isOpened, cap_read, output",
    [
        [rtsp, isOpened, cap_read, ((rtsp or rtsp == 0) and isOpened and cap_read[0])]
        for rtsp in [0, 1, "0", None, "", "rtsp://8.8.8.8/qq"]
        for isOpened in [True, False]
        for cap_read in [(True, "foo"), (False, "foo")]
    ],
)
def test_class_verify_rtsp_method(monkeypatch, rtsp, isOpened, cap_read, output):
    """test_rtsp.

    Camera should save uppercase rtsp while using lowercase for cv2
    """

    # pylint: disable=missing-class-docstring, missing-function-docstring
    # pylint: disable=invalid-name, no-self-use

    class MockedVideoCap:
        def __init__(self, *args, **kwargs):
            pass

        def isOpened(self):
            return isOpened

        def read(self):
            return cap_read

        def release(self):
            pass

    monkeypatch.setattr(
        cv2, "VideoCapture", mock.MagicMock(return_value=MockedVideoCap())
    )
    assert verify_rtsp(rtsp) == output
