# -*- coding: utf-8 -*-
"""API exceptions handled by drf
"""

from rest_framework.exceptions import APIException

CUSTOM_VISION_ACCESS_ERROR = \
    ('Training key or Endpoint is invalid. Please change the settings')
CUSTOM_VISION_MISSING_FIELD = \
    ('Either Namespace or Key is missing or incorrect. Please check again')


class CustomVisionAccessFailed(APIException):
    status_code = 503
    default_detail = CUSTOM_VISION_ACCESS_ERROR
    default_code = 'custom_vision_access_failed'
