"""App exceptions.
"""

from rest_framework.exceptions import APIException


class StreamOpenRTSPError(APIException):
    """StreamOpenRTSPError."""

    status_code = 503
    default_detail = "RTSP temporarily unavailable, please try again later."
    default_code = "stream_open_rtsp_error"


class StreamNotFoundError(APIException):
    """StreamNotFoundError."""

    status_code = 400
    default_detail = "Stream Id not found."
    default_code = "stream_not_found"


class StreamPartIdNotFound(APIException):
    """StreamPartIdNotFound."""

    status_code = 400
    default_detail = "Stream provide invalid part id."
    default_code = "stream_part_id_not_found"


class StreamRtspCameraNotFound(APIException):
    """StreamRtspCameraNotFound."""

    status_code = 400
    default_detail = "Stream provide rtsp with unknown camera."
    default_code = "stream_rtsp_camera_not_found"
