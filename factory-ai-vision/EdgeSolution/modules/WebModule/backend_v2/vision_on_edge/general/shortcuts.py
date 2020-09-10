# -*- coding: utf-8 -*-
"""General shortcuts.
"""

from django.shortcuts import Http404, get_object_or_404
from rest_framework.exceptions import APIException


class ObjectNotFoundError(APIException):
    """ObjectNotFoundError.
    """

    status_code = 404
    default_detail = {"status": "failed", "log": "Object not found"}
    default_code = 'object_not_found_error'


def drf_get_object_or_404(klass, *args, **kwargs):
    """drf_get_object_or_404.
    """
    try:
        get_object_or_404(klass, *args, **kwargs)
    except Http404:
        raise ObjectNotFoundError
