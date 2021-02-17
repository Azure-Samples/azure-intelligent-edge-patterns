"""App exceptions.
"""

from rest_framework.exceptions import APIException


# pylint: disable=line-too-long
class SettingEmptyKeyError(APIException):
    """SettingEmptyKeyError."""

    status_code = 400
    default_detail = "Setting Key is empty."
    default_code = "setting_empty_key_error"


class SettingEmptyEndpointError(APIException):
    """SettingEmptyEndpointError."""

    status_code = 400
    default_detail = "Setting Endpoint is empty."
    default_code = "setting_empty_endpoint_error"


class SettingCustomVisionAccessFailed(APIException):
    """SettingCustomVisionAccessFailed."""

    status_code = 503
    default_detail = "Training key or Endpoint is invalid. Please change the settings."
    default_code = "setting_custom_vision_access_failed"


class SettingCustomVisionCannotCreateProject(APIException):
    """SettingCustomVisionCannotCreateProject."""

    status_code = 503
    default_detail = "Custom Vision projects reach limitation. Please delete some projects or contact admin."  # noqa: E501
