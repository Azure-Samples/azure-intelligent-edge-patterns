"""App Views.
"""

from __future__ import absolute_import, unicode_literals

import logging

from azure.cognitiveservices.vision.customvision.training.models import \
    CustomVisionErrorException
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from ...general import error_messages
from ..models import Setting
from .serializers import SettingSerializer

logger = logging.getLogger(__name__)


# pylint: disable=too-many-ancestors
class SettingViewSet(viewsets.ModelViewSet):
    """SettingViewSet.
    """

    queryset = Setting.objects.all()
    serializer_class = SettingSerializer

    @action(detail=True, methods=["get"])
    def list_projects(self, request, **kwargs) -> Response:
        """list_projects.

        Args:
            request:
            kwargs:

        Returns:
            200 { 'project_id_1' : 'project_name_1',
                'project_id_2' : 'project_name_2'}
            or
            400 bad_request
        """

        try:
            setting_obj = self.queryset.get(pk=kwargs['pk'])
            if not setting_obj.training_key:
                raise ValueError("Training Key")
            if not setting_obj.endpoint:
                raise ValueError("Endpoint")
            trainer = setting_obj.get_trainer_obj()
            result = {}
            project_list = trainer.get_projects()
            for project in project_list:
                result[project.id] = project.name
            return Response(result)
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
        except Exception as exception:
            logger.exception("Unexpected Error while listing projects")
            return Response(
                {
                    "status": "failed",
                    "log":
                        str(exception)  # Force yapf to change line...
                },
                status=status.HTTP_400_BAD_REQUEST)


# pylint: enable=too-many-ancestors
