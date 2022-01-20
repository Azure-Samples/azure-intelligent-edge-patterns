"""App model tests.
"""
from unittest import mock

import pytest
from django.db.models import signals

from .. import models
from ..exceptions import CameraRtspInvalid
from ..models import Camera
from .factories import CameraFactory

pytestmark = pytest.mark.django_db

# pylint: disable=W0613
# skip unused-argument mock_cv2_capture


@pytest.mark.fast
def test_rtsp(mock_cv2_capture):
    """test_rtsp.

    Camera should save uppercase rtsp while using lowercase for cv2
    """
    cam1 = CameraFactory()
    cam1.rtsp = "RTSP://fake_url"
    cam1.save()
    assert cam1.rtsp == "RTSP://fake_url"


@pytest.mark.fast
def test_rtsp_none(mock_cv2_capture):
    """test_rtsp."""
    cam1 = CameraFactory()
    cam1.rtsp = None
    with pytest.raises(CameraRtspInvalid):
        cam1.save()


@pytest.mark.fast
def test_verify_fail(monkeypatch):
    """test_rtsp."""
    # verify fail
    monkeypatch.setattr(models, "verify_rtsp", mock.MagicMock(return_value=False))
    with pytest.raises(CameraRtspInvalid):
        cam1 = CameraFactory()
        cam1.save()


@pytest.mark.fast
def test_model_str_method(mock_cv2_capture):
    """test_rtsp."""

    cam_obj = CameraFactory()
    assert str(cam_obj) == cam_obj.name


@pytest.mark.fast
def test_model_repr_method(mock_cv2_capture):
    """test_rtsp."""

    cam_obj = CameraFactory()
    assert cam_obj.__repr__() == cam_obj.name.__repr__()


@pytest.mark.fast
def test_model_skip_signals():
    """test_rtsp."""
    signals.pre_save.disconnect(sender=Camera, dispatch_uid="Camera_pre")
    cam_obj = CameraFactory()
    cam_obj.is_demo = False
    cam_obj.save()
    signals.pre_save.connect(Camera.pre_save, Camera, dispatch_uid="Camera_pre")

    with pytest.raises(CameraRtspInvalid):
        cam_obj.save()
    cam_obj.skip_signals = True
    cam_obj.save()
