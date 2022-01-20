"""App API views.
"""

import logging

from rest_framework import viewsets
from rest_framework.response import Response

from ..models import Feedback
from .serializers import FeedbackSerializer

logger = logging.getLogger(__name__)


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer

    def create(self, request):

        serialized_data = self.serializer_class(data=request.data)
        # logger.warning('serialized data type:%s'%type(serialized_data))
        if serialized_data.is_valid():
            logger.info("is_valid")
            serialized_data.save()

            return Response(data=serialized_data.data, status=201)
        return Response(serialized_data.errors, status=400)
