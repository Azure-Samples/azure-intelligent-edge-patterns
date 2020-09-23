"""App model tests.
"""

from unittest import mock

import pytest

from .factories import CameraFactory

pytestmark = pytest.mark.django_db


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.cameras.models.Camera.verify_rtsp",
    mock.MagicMock(return_value=True),
)
def test_rtsp():
    """test_rtsp.

    Camera should save uppercase rtsp while using lowercase for cv2
    """
    cam1 = CameraFactory()
    cam1.rtsp = "RTSP://fake_url"
    cam1.save()
    assert cam1.rtsp == "RTSP://fake_url"
