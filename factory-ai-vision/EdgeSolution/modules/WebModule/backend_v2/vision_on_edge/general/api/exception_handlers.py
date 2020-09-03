# -*- coding: utf-8 -*-
"""API exception_handler.
"""

from rest_framework.response import Response
from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException
from .serializers import MSStyleErrorResponseSerializer


def ms_style_exception_handler(exc, context):
    """exception_handler.

    Args:
        exc:
        context:
    """
    response = exception_handler(exc, context)

    if isinstance(exc, APIException) and response is not None:
        res_data = {}
        response.data['status_code'] = response.status_code
        response.data['code'] = exc.detail.code
        response.data['message'] = str(exc.detail)
        res_data["error"] = response.data
        serializer = MSStyleErrorResponseSerializer(data=res_data)
        if serializer.is_valid(raise_exception=False):
            return Response(serializer.validated_data,
                            status=response.status_code)
    # Fallback
    return response
