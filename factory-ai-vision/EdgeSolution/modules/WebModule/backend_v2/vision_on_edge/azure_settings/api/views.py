# -*- coding: utf-8 -*-
"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import logging

from azure.cognitiveservices.vision.customvision.training.models import \
    CustomVisionErrorException

from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ..exceptions import (SettingCustomVisionAccessFailed,
                          SettingEmptyEndpointError, SettingEmptyKeyError)
from ..models import Setting
from .serializers import ListProjectSerializer, SettingSerializer

logger = logging.getLogger(__name__)


# pylint: disable=too-many-ancestors
class SettingViewSet(viewsets.ModelViewSet):
    """SettingViewSet.
    """

    queryset = Setting.objects.all()
    serializer_class = SettingSerializer

    @swagger_auto_schema(operation_summary='List all Custom Vision projects.',
                         responses={'200': ListProjectSerializer})
    @action(detail=True, methods=["get"])
    def list_projects(self, request, pk=None) -> Response:
        """list_projects.
        """
        queryset = self.get_queryset()
        setting_obj = get_object_or_404(queryset, pk=pk)

        try:
            if not setting_obj.training_key:
                raise SettingEmptyKeyError
            if not setting_obj.endpoint:
                raise SettingEmptyEndpointError
            result = {'projects': []}
            project_list = setting_obj.get_projects()
            for project in project_list:
                result["projects"].append({
                    "id": project.id,
                    "name": project.name
                })
            serializer = ListProjectSerializer(data=result)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data)
        except CustomVisionErrorException:
            raise SettingCustomVisionAccessFailed


# pylint: enable=too-many-ancestors
