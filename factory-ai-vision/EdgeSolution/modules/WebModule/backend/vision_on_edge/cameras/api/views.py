"""
Camera views
"""
from __future__ import absolute_import, unicode_literals

import base64
import datetime
import io
import logging

from azure.iot.device import IoTHubModuleClient
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.images import ImageFile
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from filters.mixins import FiltersMixin
from rest_framework import filters, viewsets
from rest_framework.decorators import api_view

from configs.app_insight import APP_INSIGHT_INST_KEY

from ..models import Annotation, Camera, Image, Part, Stream
from .serializers import (AnnotationSerializer, CameraSerializer,
                          ImageSerializer, PartSerializer)

# from rest_framework import status
# from rest_framework.response import Response

# from azure.iot.hub import IoTHubRegistryManager
# from azure.iot.hub.models import Twin, TwinProperties
# try:
#    iot = IoTHubRegistryManager(IOT_HUB_CONNECTION_STRING)
# except:
#    iot = None

logger = logging.getLogger(__name__)


def is_edge():
    """Determine is edge or not. Return bool"""
    try:
        IoTHubModuleClient.create_from_edge_environment()
        return True
    except:
        return False


def inference_module_url():
    """Return Inference URL"""
    if is_edge():
        return "172.18.0.1:5000"
    return "localhost:5000"


class PartViewSet(FiltersMixin, viewsets.ModelViewSet):
    """
    Part ModelViewSet.Partname should be unique.

    Available filters:
    @is_demo
    """

    queryset = Part.objects.all()
    serializer_class = PartSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        "is_demo": "is_demo",
    }


class CameraViewSet(FiltersMixin, viewsets.ModelViewSet):
    """
    Camera ModelViewSet

    Available filters:
    @is_demo
    """

    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    filter_backends = (filters.OrderingFilter,)
    filter_mappings = {
        "is_demo": "is_demo",
    }


class ImageViewSet(viewsets.ModelViewSet):
    """
    Image ModelViewSet
    """

    queryset = Image.objects.all()
    serializer_class = ImageSerializer


class AnnotationViewSet(viewsets.ModelViewSet):
    """
    Annotation ModelViewSet
    """

    queryset = Annotation.objects.all()
    serializer_class = AnnotationSerializer


#
# Stream Views
#
streams = []


@api_view()
def connect_stream(request):
    """Connect to stream"""
    part_id = request.query_params.get("part_id")
    rtsp = request.query_params.get("rtsp") or "0"
    inference = (not not request.query_params.get("inference")) or False
    if part_id is None:
        return JsonResponse({
            "status": "failed",
            "reason": "part_id is missing"
        })

    try:
        Part.objects.get(pk=int(part_id))
        s = Stream(rtsp, part_id=int(part_id), inference=inference)
        streams.append(s)
        return JsonResponse({"status": "ok", "stream_id": s.id})
    except ObjectDoesNotExist:
        return JsonResponse({
            "status": "failed",
            "reason": "part_id doesnt exist"
        })


@api_view()
def disconnect_stream(request, stream_id):
    """Disconnect from stream"""
    for i in range(len(streams)):
        stream = streams[i]
        if stream.id == stream_id:
            stream.close()
            return JsonResponse({"status": "ok"})
    return JsonResponse({
        "status": "failed",
        "reason": "cannot find stream_id " + str(stream_id)
    })


def video_feed(request, stream_id):
    """video feed"""
    for i in range(len(streams)):
        stream = streams[i]
        if stream.id == stream_id:
            return StreamingHttpResponse(
                stream.gen(),
                content_type="multipart/x-mixed-replace;boundary=frame")

    return HttpResponse("<h1>Unknown Stream " + str(stream_id) + " </h1>")


def capture(request, stream_id):
    """Capture image"""
    for i in range(len(streams)):
        stream = streams[i]
        if stream.id == stream_id:
            img_data = stream.get_frame()
            img_io = io.BytesIO(img_data)
            img = ImageFile(img_io)
            img.name = datetime.datetime.utcnow().isoformat() + ".jpg"
            logger.info(stream)
            logger.info(stream.part_id)
            img_obj = Image(image=img, part_id=stream.part_id)
            img_obj.save()
            img_serialized = ImageSerializer(img_obj,
                                             context={"request": request})
            logger.info(img_serialized.data)

            return JsonResponse({"status": "ok", "image": img_serialized.data})

    return JsonResponse({
        "status": "failed",
        "reason": "cannot find stream_id " + str(stream_id)
    })


@api_view(["POST"])
def upload_relabel_image(request):
    """upload relable image"""
    part_name = request.data["part_name"]
    labels = request.data["labels"]
    img_data = base64.b64decode(request.data["img"])
    confidence = request.data["confidence"]
    # is_relabel = request.data["is_relabel"]

    parts = Part.objects.filter(name=part_name, is_demo=False)
    if len(parts) == 0:
        logger.error("Unknown Part Name: %s", part_name)
        return JsonResponse({"status": "failed"})

    img_io = io.BytesIO(img_data)

    img = ImageFile(img_io)
    img.name = datetime.datetime.utcnow().isoformat() + ".jpg"
    img_obj = Image(
        image=img,
        part_id=parts[0].id,
        labels=labels,
        confidence=confidence,
        is_relabel=True,
    )
    img_obj.save()

    return JsonResponse({"status": "ok"})


@api_view(["POST"])
def relabel_update(request):
    """
    Update relabel image
    """
    logger.info("update relabeling")
    data = request.data
    if type(data) is not type([]):
        logger.info("data should be array of object {}")
        return JsonResponse({"status": "failed"})

    for item in data:
        image_id = item["imageId"]
        part_id = item["partId"]
        img_obj = Image.objects.get(pk=image_id)
        if part_id is not None:
            img_obj.is_relabel = False
            img_obj.part_id = part_id
            img_obj.save()
            logger.info("image %s with part %s added from relabeling pool",
                        image_id, part_id)
        else:
            img_obj.delete()
            logger.info("image %s removed from relabeling pool", image_id)

    return JsonResponse({"status": "ok"})


@api_view()
def inference_video_feed(request, project_id):
    """Return inferenced video feed"""
    return JsonResponse({
        "status": "ok",
        "url": "http://" + inference_module_url() + "/video_feed?inference=1",
    })


@api_view()
def instrumentation_key(request):
    """App Insight Instrument Key"""
    return JsonResponse({"status": "ok", "key": APP_INSIGHT_INST_KEY})
