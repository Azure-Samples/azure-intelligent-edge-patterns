"""App exceptions.
"""

from rest_framework.exceptions import APIException


class CameraRtspInvalid(APIException):
    """CameraRtspInvalid."""

    status_code = 400
    default_detail = "Camera rtsp is invalid."
    default_code = "camera_rtsp_invalid"


class CameraRtspBusy(APIException):
    """CameraRtspBusy."""

    status_code = 400
    default_detail = "Camera rtsp is busy."
    default_code = "camera_rtsp_busy"
