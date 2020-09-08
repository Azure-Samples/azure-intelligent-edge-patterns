# -*- coding: utf-8 -*-
"""App API views.
"""

import datetime
import io
import logging
import sys
import threading
import time

from django.core.exceptions import ObjectDoesNotExist
from django.core.files.images import ImageFile
from django.http import HttpResponse, StreamingHttpResponse
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ...azure_iot.utils import inference_module_url
from ...azure_parts.models import Part
from ...cameras.models import Camera
from ...general.api.serializers import (MSStyleErrorResponseSerializer,
                                        SimpleErrorSerializer)
from ...general.api.swagger_schemas import StreamAutoSchema
from ...images.api.serializers import ImageSerializer
from ...images.models import Image
from ..models import Stream
from .serializers import (CaptureStreamResponseSerializer,
                          ConnectStreamResponseSerializer)

logger = logging.getLogger(__name__)

# Stream Views
#
STREAM_GC_TIME_THRESHOLD = 5000  # Seconds
PRINT_STREAMS = False


class StreamManager():
    """StreamManager
    """

    def __init__(self):
        self.streams = []
        self.mutex = threading.Lock()
        self.gc()

    def add(self, stream: Stream):
        """add stream
        """
        self.streams.append(stream)

    def get_stream_by_id(self, stream_id):
        """get_stream_by_id
        """

        self.mutex.acquire()

        for i in range(len(self.streams)):
            stream = self.streams[i]
            if stream.id == stream_id:

                self.mutex.release()
                return stream

        self.mutex.release()
        return None

    def gc(self):
        """Garbage collector

        IMPORTANT, autoreloader will not reload threading,
        please restart the server if you modify the thread
        """

        def _gc(self):
            while True:
                self.mutex.acquire()
                if PRINT_STREAMS:
                    logger.info("streams: %s", self.streams)
                to_delete = []
                for index, stream in enumerate(self.streams):
                    if stream.last_active + STREAM_GC_TIME_THRESHOLD < time.time(
                    ):

                        # stop the inactive stream
                        # (the ones users didnt click disconnect)
                        logger.info('stream %s inactive', stream)
                        stream.close()

                        # collect the stream, to delete later
                        to_delete.append(stream)

                for stream in to_delete:
                    self.streams.remove(stream)

                self.mutex.release()
                time.sleep(3)

        threading.Thread(target=_gc, args=(self,)).start()


if 'runserver' in sys.argv:
    stream_manager = StreamManager()


@swagger_auto_schema(operation_summary='Create a rtsp stream.',
                     method='get',
                     manual_parameters=[
                         openapi.Parameter('rtsp',
                                           openapi.IN_QUERY,
                                           type=openapi.TYPE_STRING,
                                           description='RTSP'),
                         openapi.Parameter('part_id',
                                           openapi.IN_QUERY,
                                           type=openapi.TYPE_STRING,
                                           description='Part ID',
                                           required=False)
                     ],
                     responses={
                         '200': ConnectStreamResponseSerializer,
                         '400': MSStyleErrorResponseSerializer
                     })
@api_view(['GET'])
def connect_stream(request):
    """connect_stream.

    Args:
        request:
    """
    part_id = request.query_params.get("part_id") or None
    rtsp = request.query_params.get("rtsp") or "0"
    if part_id is not None:
        try:
            Part.objects.get(pk=part_id)
        except ObjectDoesNotExist:
            return Response(
                {
                    "status": "failed",
                    "log": "part_id doesnt exist."  # yapf
                },
                status=status.HTTP_400_BAD_REQUEST)
        part_id = (int(part_id))
    if not Camera.objects.filter(rtsp=rtsp).exists():
        return Response(
            {
                "status": "failed",
                "log": "rtsp given does not belong to any camera."
            },
            status=status.HTTP_400_BAD_REQUEST)
    camera_id = Camera.objects.filter(rtsp=rtsp).first().id
    stream_obj = Stream(rtsp=rtsp, camera_id=camera_id, part_id=part_id)
    stream_manager.add(stream_obj)
    response_data = {"status": "ok", "stream_id": stream_obj.id}
    serializer = ConnectStreamResponseSerializer(data=response_data)
    if serializer.is_valid(raise_exception=True):
        return Response(serializer.validated_data)


@api_view()
def disconnect_stream(request, stream_id):
    """Disconnect from stream
    """

    stream = stream_manager.get_stream_by_id(stream_id)
    if stream:
        stream.close()
        return Response({'status': 'ok'})

    return Response(
        {
            "status": "failed",
            "reason": "cannot find stream_id " + str(stream_id)
        },
        status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(auto_schema=StreamAutoSchema,
                     method='get',
                     operation_summary='Open a video stream.',
                     manual_parameters=[
                         openapi.Parameter('stream_id',
                                           openapi.IN_PATH,
                                           type=openapi.TYPE_INTEGER,
                                           description='Stream ID'),
                     ],
                     responses={'400': SimpleErrorSerializer})
@api_view(['GET'])
def video_feed(request, stream_id):
    """video feed
    """

    stream = stream_manager.get_stream_by_id(stream_id)
    if stream:
        return StreamingHttpResponse(
            stream.gen(),
            content_type="multipart/x-mixed-replace;boundary=frame")

    return HttpResponse("<h1>Unknown Stream " + str(stream_id) + " </h1>",
                        status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    operation_summary='Capture an image from stream.',
    method='get',
    manual_parameters=[
        openapi.Parameter('stream_id',
                          openapi.IN_PATH,
                          type=openapi.TYPE_STRING,
                          description='Stream Id'),
        openapi.Parameter('part_id',
                          openapi.IN_QUERY,
                          type=openapi.TYPE_STRING,
                          description='Part Id',
                          required=False),
    ],
)
@api_view(['GET'])
def capture(request, stream_id):
    """Capture image.
    """
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
        img_obj = Image(image=img, part_id=part_id, camera_id=camera_id)
        img_obj.save()
        img_serializer = ImageSerializer(img_obj, context={"request": request})
        response_data = {"status": "ok", "image": img_serializer.data}
        #response_serializer = CaptureStreamResponseSerializer(
        #    data=response_data)
        #if response_serializer.is_valid(raise_exception=True):
        return Response(response_data)

    return Response(
        {
            "status": "failed",
            "log": "cannot find stream_id " + str(stream_id)
        },
        status=status.HTTP_400_BAD_REQUEST)


@api_view()
def keep_alive(request, stream_id):
    """keep stream alive
    """

    logger.info("Keeping streams alive")
    stream = stream_manager.get_stream_by_id(stream_id)
    if stream:
        stream.update_keep_alive()
        return Response({'status': 'ok'})

    return Response(
        {
            "status": "failed",
            "reason": "cannot find stream_id " + str(stream_id)
        },
        status=status.HTTP_400_BAD_REQUEST)


@api_view()
def inference_video_feed(request, project_id):
    """inference_video_feed
    """

    return Response({
        "status": "ok",
        "url": "http://" + inference_module_url() + "/video_feed?inference=1",
    })
