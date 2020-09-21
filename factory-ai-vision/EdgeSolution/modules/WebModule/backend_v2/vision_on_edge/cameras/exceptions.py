# -*- coding: utf-8 -*-
"""App exceptions.
"""

from rest_framework.exceptions import APIException


# pylint: disable=line-too-long
class CameraRtspInvalid(APIException):
    """SettingEmptyKeyError.
    """

    status_code = 400
    default_detail = "Camera rtsp is invalid or busy."
    default_code = "camera_rtsp_invalid"
