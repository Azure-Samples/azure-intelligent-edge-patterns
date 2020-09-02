# -*- coding: utf-8 -*-
"""App exceptions.
"""

from rest_framework.exceptions import APIException

class StreamOpenRTSPError(APIException):
    """StreamOpenRTSPError.
    """

    status_code = 503
    default_detail = 'RTSP temporarily unavailable, try again later.'
    default_code = 'rtsp_unavailable'
