"""API exception_handler.
"""

from rest_framework.exceptions import APIException, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler

from .serializers import MSStyleErrorResponseSerializer


def ms_style_exception_handler(exc, context):
    """exception_handler.

    Args:
        exc:
        context:
    """
    response = exception_handler(exc, context)

    if isinstance(exc, APIException) and response is not None:
        res_data = {"error": {}}
        res_data["error"]["status_code"] = response.status_code
        if isinstance(exc, ValidationError):
            res_data["error"]["code"] = "validation_error"
        else:
            res_data["error"]["code"] = exc.detail.code
        res_data["error"]["message"] = str(exc.detail)
        serializer = MSStyleErrorResponseSerializer(data=res_data)
        if serializer.is_valid(raise_exception=False):
            return Response(serializer.validated_data, status=response.status_code)
    # Fallback
    return response
