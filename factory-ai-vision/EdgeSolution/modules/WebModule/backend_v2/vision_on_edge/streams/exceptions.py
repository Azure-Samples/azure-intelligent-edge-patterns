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
