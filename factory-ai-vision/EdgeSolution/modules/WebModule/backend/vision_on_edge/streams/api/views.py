"""App API views.
"""

import datetime
import io
import logging
import sys

from django.core.exceptions import ObjectDoesNotExist
from django.core.files.images import ImageFile
from django.http import HttpResponse, StreamingHttpResponse
from drf_yasg2 import openapi
from drf_yasg2.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ...azure_iot.utils import inference_module_url
from ...azure_parts.models import Part
from ...cameras.models import Camera
from ...general.api.serializers import (
    MSStyleErrorResponseSerializer,
    SimpleOKSerializer,
)
from ...images.api.serializers import ImageSerializer
from ...images.models import Image
from ...azure_projects.models import Project
from ..exceptions import (
    StreamNotFoundError,
    StreamPartIdNotFound,
    StreamRtspCameraNotFound,
)
from ..models import Stream, StreamManager
from .serializers import (
    StreamCaptureResponseSerializer,
    StreamConnectResponseSerializer,
)

logger = logging.getLogger(__name__)

if "runserver" in sys.argv:
    stream_manager = StreamManager()


@swagger_auto_schema(
    operation_summary="Create a rtsp stream.",
    method="get",
    manual_parameters=[
        openapi.Parameter(
            "camera_id",
            openapi.IN_QUERY,
            type=openapi.TYPE_STRING,
            description="Camera ID",
        ),
        openapi.Parameter(
            "part_id",
            openapi.IN_QUERY,
            type=openapi.TYPE_STRING,
            description="Part ID",
            required=False,
        ),
    ],
    responses={
        "200": StreamConnectResponseSerializer,
        "400": MSStyleErrorResponseSerializer,
    },
)
@api_view(["GET"])
def connect_stream(request):
    """connect_stream.

    Args:
        request:
    """
    part_id = request.query_params.get("part_id") or None
    camera_id = request.query_params.get("camera_id")
    if part_id is not None:
        try:
            Part.objects.get(pk=part_id)
        except ObjectDoesNotExist:
            raise StreamPartIdNotFound
        part_id = int(part_id)
    if not Camera.objects.filter(pk=camera_id).exists():
        raise StreamRtspCameraNotFound
    camera_obj = Camera.objects.get(pk=camera_id)
    stream_obj = Stream(rtsp=camera_obj.rtsp, camera_id=camera_id, part_id=part_id)
    stream_manager.add(stream_obj)
    response_data = {"status": "ok", "stream_id": stream_obj.id}
    serializer = StreamConnectResponseSerializer(data=response_data)
    serializer.is_valid(raise_exception=True)
    return Response(serializer.validated_data)


@swagger_auto_schema(
    operation_summary="Disconnect a rtsp stream.",
    method="get",
    manual_parameters=[
        openapi.Parameter(
            "stream_id",
            openapi.IN_PATH,
            type=openapi.TYPE_STRING,
            description="Stream Id",
        )
    ],
    responses={"200": SimpleOKSerializer, "400": MSStyleErrorResponseSerializer},
)
@api_view()
def disconnect_stream(request, stream_id):
    """Disconnect from stream"""

    stream = stream_manager.get_stream_by_id(stream_id)
    if stream:
        stream.close()
        return Response({"status": "ok"})
    raise StreamNotFoundError


def video_feed(request, stream_id):
    """video feed"""

    stream = stream_manager.get_stream_by_id(stream_id)
    if stream:
        return StreamingHttpResponse(
            stream.gen(), content_type="multipart/x-mixed-replace;boundary=frame"
        )

    return HttpResponse(
        "<h1>Unknown Stream " + str(stream_id) + " </h1>",
        status=status.HTTP_400_BAD_REQUEST,
    )


@swagger_auto_schema(
    operation_summary="Capture an image from stream.",
    method="get",
    manual_parameters=[
        openapi.Parameter(
            "stream_id",
            openapi.IN_PATH,
            type=openapi.TYPE_STRING,
            description="Stream Id",
        ),
        openapi.Parameter(
            "part_id",
            openapi.IN_QUERY,
            type=openapi.TYPE_STRING,
            description="Part Id",
            required=False,
        ),
    ],
    responses={
        "200": StreamCaptureResponseSerializer,
        "400": MSStyleErrorResponseSerializer,
    },
)
@api_view(["GET"])
def capture(request, stream_id):
    """Capture image."""
    project_id = request.query_params.get("project") or None
    if project_id:
        project = Project.objects.get(pk=project_id)
    stream = stream_manager.get_stream_by_id(stream_id)
    if stream:
        img_data = stream.get_frame()
        img_io = io.BytesIO(img_data)
        img = ImageFile(img_io)
        img.name = datetime.datetime.utcnow().isoformat() + ".jpg"
        logger.info(stream)
        logger.info(stream.part_id)
        part_id = request.query_params.get("part_id") or stream.part_id
        camera_id = stream.camera_id
        img_obj = Image(image=img, part_id=part_id, camera_id=camera_id, project=project)
        img_obj.save()
        img_serializer = ImageSerializer(img_obj, context={"request": request})
        response_data = {"status": "ok", "image": img_serializer.data}
        # serializer = StreamCaptureResponseSerializer(data=response_data)
        # serializer.is_valid(raise_exception=True)
        return Response(response_data)
    raise StreamNotFoundError


@swagger_auto_schema(
    operation_summary="Keep a stream alive.",
    method="get",
    manual_parameters=[
        openapi.Parameter(
            "stream_id",
            openapi.IN_PATH,
            type=openapi.TYPE_STRING,
            description="Stream Id",
        )
    ],
    responses={"200": SimpleOKSerializer, "400": MSStyleErrorResponseSerializer},
)
@api_view()
def keep_alive(request, stream_id):
    """keep stream alive"""

    logger.info("Keeping streams alive")
    stream = stream_manager.get_stream_by_id(stream_id)
    if stream:
        logger.info("===============================")
        logger.info("Last active %s", stream.last_active)
        stream.update_keep_alive()
        logger.info("Last active %s", stream.last_active)
        logger.info("===============================")
        return Response({"status": "ok"})
    raise StreamNotFoundError


@api_view()
def inference_video_feed(request, project_id):
    """inference_video_feed"""

    return Response(
        {
            "status": "ok",
            "url": "http://" + inference_module_url() + "/video_feed?inference=1",
        }
    )
