"""General shortcuts.
"""

from django.shortcuts import Http404, get_object_or_404
from rest_framework.exceptions import APIException, NotFound


def drf_get_object_or_404(klass, *args, **kwargs):
    """drf_get_object_or_404."""
    try:
        return get_object_or_404(klass, *args, **kwargs)
    except Http404:
        raise NotFound(
            detail=(str(klass) + " args: " + str(args) + " kwargs: " + str(kwargs))
        )
    except Exception as error:
        raise APIException(detail=str(error))
