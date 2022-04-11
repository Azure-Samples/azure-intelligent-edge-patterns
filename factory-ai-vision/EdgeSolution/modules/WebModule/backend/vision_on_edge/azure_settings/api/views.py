"""App API views.
"""

from __future__ import absolute_import, unicode_literals

import logging

from azure.cognitiveservices.vision.customvision.training.models import (
    CustomVisionErrorException,
)
from drf_yasg2.utils import swagger_auto_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ...general.api.serializers import MSStyleErrorResponseSerializer
from ...general.shortcuts import drf_get_object_or_404
from ..exceptions import (
    SettingCustomVisionAccessFailed,
    SettingEmptyEndpointError,
    SettingEmptyKeyError,
)
from ..models import Setting
from .serializers import ListProjectSerializer, SettingSerializer

logger = logging.getLogger(__name__)


# pylint: disable=too-many-ancestors
class SettingViewSet(viewsets.ModelViewSet):
    """SettingViewSet."""

    queryset = Setting.objects.all()
    serializer_class = SettingSerializer

    @swagger_auto_schema(
        operation_summary="List all Custom Vision projects.",
        responses={"200": ListProjectSerializer, "400": MSStyleErrorResponseSerializer},
    )
    @action(detail=True, methods=["get"])
    def list_projects(self, request, pk=None) -> Response:
        """list_projects."""
        queryset = self.get_queryset()
        setting_obj = drf_get_object_or_404(queryset, pk=pk)
        trainer = setting_obj.get_trainer_obj()

        try:
            if not setting_obj.training_key:
                raise SettingEmptyKeyError
            if not setting_obj.endpoint:
                raise SettingEmptyEndpointError
            result = {"projects": []}
            project_list = setting_obj.get_projects()
            for project in project_list:
                result["projects"].append(
                    {
                        "id": project.id, 
                        "name": project.name,
                        "exportable": trainer.get_domain(project.settings.domain_id).exportable
                    }
                )
            serializer = ListProjectSerializer(data=result)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.validated_data)
        except CustomVisionErrorException:
            raise SettingCustomVisionAccessFailed

    @action(detail=True, methods=["get"])
    def project_info(self, request, pk=None):
        queryset = self.get_queryset()
        setting_obj = drf_get_object_or_404(queryset, pk=pk)
        trainer = setting_obj.get_trainer_obj()
        customvision_id = request.query_params.get("customvision_id")
        domain_type = trainer.get_domain(trainer.get_project(customvision_id).settings.domain_id).type
        classification_type = ""
        if domain_type == "Classification":
            classification_type = trainer.get_project(customvision_id).settings.classification_type
        results = {"tags":[], "type":domain_type, "classification_type":classification_type}
        tag_list = trainer.get_tags(customvision_id)
        for tag in tag_list:
            results["tags"].append(tag.name)
        return Response(results)