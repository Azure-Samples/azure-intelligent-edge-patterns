"""Testing general.utils
"""

import pytest

from vision_on_edge.general.utils import normalize_rtsp

test_data = [
    ("rtsp", "rtsp"),
    ("RTSP", "rtsp"),
    ("RtSp", "rtsp"),
    ("RTSP://RTSP", "rtsp://RTSP"),
    (0, 0),
    ("rtsp://google.com", "rtsp://google.com"),
    ("RTSP://google.com/RTSP", "rtsp://google.com/RTSP"),
]


@pytest.mark.parametrize("input_str, output", test_data)
def test_normalize_rtsp(input_str, output):
    assert normalize_rtsp(input_str) == output
