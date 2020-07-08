"""
Camera utils views
"""

import logging

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..models import Camera

logger = logging.getLogger(__name__)


@api_view()
def verify_rtsp(request):
    """test if a rtsp is valid"""
    logger.info("Verifying rtsp")
    rtsp = request.query_params.get('rtsp')
    logger.info("rtsp %s", rtsp)

    if rtsp is None:
        return Response(
            {
                'status': 'failed',
                'log': 'rtsp not given'
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    rtsp_ok = Camera.verify_rtsp(rtsp)
    if not rtsp_ok:
        return Response(
            {
                'status': 'failed',
                'log': 'rtsp not valid'
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    return Response({'status': 'ok'})
