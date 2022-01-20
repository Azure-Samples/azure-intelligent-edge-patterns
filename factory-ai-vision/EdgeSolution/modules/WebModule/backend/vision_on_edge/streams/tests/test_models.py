"""App model tests.
"""
# pylint: disable=W0613
# skip unused-argument mock_cv2_capture

import time

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


@pytest.mark.fast
def test_method_keep_alive(camera):
    """test_method_keep_alive."""
    time_start = time.time()
    stream_obj = Stream(rtsp=camera.rtsp, camera_id=camera.id)
    stream_obj.update_keep_alive()
    assert stream_obj.last_active > time_start


@pytest.mark.fast
def test_method_gen(camera):
    """test_method_get_frame."""
    stream_obj = Stream(rtsp=camera.rtsp, camera_id=camera.id)
    assert stream_obj.cur_img_index == 0
    assert stream_obj.last_get_img_index == 1
    gen = stream_obj.gen()
    next(gen)
    assert stream_obj.cur_img_index == 1
    assert stream_obj.last_get_img_index == 1
    next(gen)
    assert stream_obj.cur_img_index == 2
    assert stream_obj.last_get_img_index == 1


@pytest.mark.fast
def test_method_get_frame(camera):
    """test_method_get_frame.

    Make sure a stream can get_frame right after it init.
    (No gen() call needed)
    """
    time_start = time.time()
    stream_obj = Stream(rtsp=camera.rtsp, camera_id=camera.id)
    stream_obj.get_frame()
    assert time.time() - time_start < 3


@pytest.mark.fast
def test_method_get_frame_after_generated(camera):
    """test_method_get_frame.

    Make sure a stream can get_frame right after gen()
    """
    time_start = time.time()
    stream_obj = Stream(rtsp=camera.rtsp, camera_id=camera.id)
    stream_obj.get_frame()
    next(stream_obj.gen())
    stream_obj.get_frame()
    assert time.time() - time_start < 3


def test_method_get_frame_no_generated(camera):
    """test_method_get_frame.

    Make sure a stream will wait to try get a new image
    """
    time_start = time.time()
    stream_obj = Stream(rtsp=camera.rtsp, camera_id=camera.id)
    stream_obj.get_frame()
    stream_obj.get_frame()
    assert time.time() - time_start > 3


@pytest.mark.fast
def test_method_get_frame_after_generated_twice(camera):
    """test_method_get_frame."""
    stream_obj = Stream(rtsp=camera.rtsp, camera_id=camera.id)
    gen = stream_obj.gen()
    next(gen)
    next(gen)
    next(gen)


@pytest.mark.fast
def test_method_gen_members(camera):
    """test_method_get_frame."""
    stream_obj = Stream(rtsp=camera.rtsp, camera_id=camera.id)
    assert stream_obj.cur_img_index == 0
    assert stream_obj.last_get_img_index == 1
    gen = stream_obj.gen()
    next(gen)
    assert stream_obj.cur_img_index == 1
    assert stream_obj.last_get_img_index == 1
    next(gen)
    assert stream_obj.cur_img_index == 2
    assert stream_obj.last_get_img_index == 1
    stream_obj.get_frame()
    assert stream_obj.cur_img_index == 2
    assert stream_obj.last_get_img_index == 2


@pytest.mark.fast
def test_method_stop(camera):
    """test_method_get_frame."""
    stream_obj = Stream(rtsp=camera.rtsp, camera_id=camera.id)
    assert stream_obj.status == "init"
    gen = stream_obj.gen()
    next(gen)
    assert stream_obj.status == "running"
    stream_obj.close()
    assert stream_obj.status == "stopped"
