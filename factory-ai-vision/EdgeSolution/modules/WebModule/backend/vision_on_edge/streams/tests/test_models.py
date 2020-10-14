"""App model tests.
"""

from unittest import mock

import pytest

from ...cameras.tests.factories import CameraFactory
from ..models import Stream

pytestmark = pytest.mark.django_db


@pytest.mark.fast
@pytest.mark.parametrize(
    "rtsp_input, output",
    [
        [0, 0],
        ["0", 0],
        [1, 1],
        ["1", 1],
        ["RTSP://QQ", "rtsp://QQ"],
        ["rtsp://QQ", "rtsp://QQ"],
        ["rTsP://QQ", "rtsp://QQ"],
        ["@@rtsp://QQ", "@@rtsp://QQ"],
        ["rtP://QQ", "rtP://QQ"],
        ["http://www.google.com", "http://www.google.com"],
    ],
)
def test_rtsp(mock_cv2_capture, rtsp_input, output):
    """test_rtsp.

    stream open rtsp should be lowercase
    [0, "0"] => 0
    [1. "1"] => 1
    """
    cam1 = CameraFactory()
    cam1.rtsp = rtsp_input
    cam1.save()
    stream1 = Stream(rtsp=cam1.rtsp, camera_id=cam1.id)
    assert stream1.rtsp == output
