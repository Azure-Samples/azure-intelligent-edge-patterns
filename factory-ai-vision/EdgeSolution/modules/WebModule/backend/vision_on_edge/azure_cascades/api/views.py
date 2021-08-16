"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import datetime
import logging
from distutils.util import strtobool

from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import Cascade
from .serializers import CascadeSerializer

logger = logging.getLogger(__name__)



class CascadeViewSet(FiltersMixin, viewsets.ModelViewSet):
    """Cascade ModelViewSet

    Filters:
        is_demo
    """

    queryset = Cascade.objects.all()
    serializer_class = CascadeSerializer
