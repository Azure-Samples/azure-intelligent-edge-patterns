"""App utils views.
"""

import logging

from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..exceptions import CameraRtspInvalid
from ..utils import verify_rtsp as verify_rtsp_func

logger = logging.getLogger(__name__)


@api_view()
def verify_rtsp(request):
    """verify_rtsp.

    Args:
        request:
    """
    logger.info("Verifying rtsp")
    rtsp = request.query_params.get("rtsp")
    logger.info("rtsp %s", rtsp)

    if rtsp is None:
        raise CameraRtspInvalid
    rtsp_ok = verify_rtsp_func(rtsp)
    if not rtsp_ok:
        raise CameraRtspInvalid
    return Response({"status": "ok"})
