# -*- coding: utf-8 -*-
"""App model tests.
"""

from unittest import mock

import pytest

from ..models import Stream
from ...cameras.tests.factories import CameraFactory

pytestmark = pytest.mark.django_db


class fake_cap():

    def isOpened(self):
        return True


@pytest.mark.fast
@mock.patch("vision_on_edge.cameras.models.Camera.verify_rtsp",
            mock.MagicMock(return_value=True))
@mock.patch("vision_on_edge.streams.models.cv2.VideoCapture",
            mock.MagicMock(return_value=fake_cap()))
def test_rtsp():
    """test_rtsp.

    stream open rtsp should be lowercase
    """
    cam1 = CameraFactory()
    cam1.rtsp = "RTSP://fake_url"
    cam1.save()
    stream1 = Stream(rtsp=cam1.rtsp, camera_id=cam1.id)
    assert stream1.rtsp == "rtsp://fake_url"


@pytest.mark.fast
@mock.patch("vision_on_edge.cameras.models.Camera.verify_rtsp",
            mock.MagicMock(return_value=True))
@mock.patch("vision_on_edge.streams.models.cv2.VideoCapture",
            mock.MagicMock(return_value=fake_cap()))
def test_rtsp_0():
    """test_rtsp.

    stream open rtsp "0" should be save as integer
    """
    # String 0
    cam1 = CameraFactory()
    cam1.rtsp = "0"
    cam1.save()
    stream1 = Stream(rtsp=cam1.rtsp, camera_id=cam1.id)
    assert stream1.rtsp == 0
    # Integer 0
    cam1.rtsp = 0
    cam1.save()
    stream1 = Stream(rtsp=cam1.rtsp, camera_id=cam1.id)
    assert stream1.rtsp == 0


@pytest.mark.fast
@mock.patch("vision_on_edge.cameras.models.Camera.verify_rtsp",
            mock.MagicMock(return_value=True))
@mock.patch("vision_on_edge.streams.models.cv2.VideoCapture",
            mock.MagicMock(return_value=fake_cap()))
def test_rtsp_1():
    """test_rtsp.

    stream open rtsp "1" should be save as integer
    """
    # String 1
    cam1 = CameraFactory()
    cam1.rtsp = "1"
    cam1.save()
    stream1 = Stream(rtsp=cam1.rtsp, camera_id=cam1.id)
    assert stream1.rtsp == 1
    # Integer 1
    cam1.rtsp = 1
    cam1.save()
    stream1 = Stream(rtsp=cam1.rtsp, camera_id=cam1.id)
    assert stream1.rtsp == 1
