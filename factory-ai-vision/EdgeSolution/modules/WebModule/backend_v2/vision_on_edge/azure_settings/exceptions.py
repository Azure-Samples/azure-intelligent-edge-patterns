# -*- coding: utf-8 -*-
"""App exceptions.
"""

from rest_framework.exceptions import APIException


class SettingEmptyKeyError(APIException):
    status_code = 400
    default_detail = "Setting Key is empty."
    default_code = "setting_empty_key_error"


class SettingEmptyEndpointError(APIException):
    status_code = 400
    default_detail = "Setting Endpoint is empty."
    default_code = "setting_empty_endpoint_error"


class SettingCustomVisionAccessFailed(APIException):
    status_code = 503
    default_detail = 'Training key or Endpoint is invalid. Please change the settings'
    default_code = 'setting_custom_vision_access_failed'
