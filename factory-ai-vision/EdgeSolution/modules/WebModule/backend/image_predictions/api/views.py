"""
Image Prediction ViewSet
"""
from __future__ import absolute_import, unicode_literals

import logging

from rest_framework import viewsets

from ..models import ImagePrediction
from .serializers import ImagePredictionSerializer

logger = logging.getLogger(__name__)


class ImagePredictionViewSet(viewsets.ModelViewSet):
    """
    Image Prediction ModelViewSet
    """

    queryset = ImagePrediction.objects.all()
    serializer_class = ImagePredictionSerializer
