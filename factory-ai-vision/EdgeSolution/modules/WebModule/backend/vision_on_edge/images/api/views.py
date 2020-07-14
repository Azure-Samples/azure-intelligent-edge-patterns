"""
Azure training views
"""
from __future__ import absolute_import, unicode_literals

import logging

from rest_framework import viewsets

from ..models import Image
from .serializers import ImageSerializer

logger = logging.getLogger(__name__)


class ImageViewSet(viewsets.ModelViewSet): # pylint: disable=R0901 
    """
    Image ModelViewSet
    """

    queryset = Image.objects.all()
    serializer_class = ImageSerializer
