# -*- coding: utf-8 -*-
"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import logging

from azure.cognitiveservices.vision.customvision.training.models import \
    CustomVisionErrorException
from django.shortcuts import get_object_or_404
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ...exceptions import api_exceptions as error_messages
from ..models import Setting
from .serializers import SettingSerializer, ListProjectSerializer

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
                raise ValueError("Training Key")
            if not setting_obj.endpoint:
                raise ValueError("Endpoint")
            trainer = setting_obj.get_trainer_obj()
            result = {'projects': []}
            project_list = trainer.get_projects()
            for project in project_list:
                result["projects"].append({
                    "id": project.id,
                    "name": project.name
                })
            serializer = ListProjectSerializer(data=result)
            if serializer.is_valid(raise_exception=True):
                return Response(serializer.validated_data)
        except ValueError:
            return Response(
                {
                    "status": "failed",
                    "log": error_messages.CUSTOM_VISION_MISSING_FIELD
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        except KeyError as key_err:
            if str(key_err) in ["Endpoint", "'Endpoint'"]:
                return Response(
                    {
                        "status": "failed",
                        "log": error_messages.CUSTOM_VISION_ACCESS_ERROR,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {
                    "status": "failed",
                    "log": f"KeyError {str(key_err)}"
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except CustomVisionErrorException as customvision_error:
            if (customvision_error.message ==
                    "Operation returned an invalid status code 'Access Denied'"
               ):

                return Response(
                    {
                        "status": "failed",
                        "log": error_messages.CUSTOM_VISION_ACCESS_ERROR,
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            return Response(
                {
                    "status": "failed",
                    "log": customvision_error.message
                },
                status=customvision_error.response.status_code,
            )


# pylint: enable=too-many-ancestors
