"""App exceptions.
"""

from rest_framework.exceptions import APIException


class ImageGetRemoteImageWithoutUrl(APIException):
    """ImageGetRemoteImageWithoutUrl."""

    status_code = 400
    default_detail = "Please provide remote_url before get_remote_image."
    default_code = "image_get_remote_image_without_url"


class ImageGetRemoteImageRequestsError(APIException):
    """ImageGetRemoteImageRequestError."""

    status_code = 503
    default_detail = "Get_remote_image occur requests error."
    default_code = "image_get_remote_image_requests_error"


class ImageLabelOutOfRange(APIException):
    """ImageGetRemoteImageRequestError."""

    status_code = 503
    default_detail = "Get_remote_image occur requests error."
    default_code = "image_get_remote_image_requests_error"
