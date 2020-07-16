"""
Stream views
"""

import datetime
import io
import logging

from azure.iot.device import IoTHubModuleClient
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.images import ImageFile
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from rest_framework.decorators import api_view

from ...azure_parts.models import Part
from ...images.api.serializers import ImageSerializer
from ...images.models import Image
from ..models import Stream

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
        s = Stream(rtsp, part_id=None, inference=inference)
        streams.append(s)
        return JsonResponse({"status": "ok", "stream_id": s.id})

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


@api_view()
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
            part_id = request.query_params.get("part_id") or stream.part_id
            if not part_id:
                return JsonResponse({
                    "status": "failed",
                    "reason": "neither Stream and capture request have part_id"
                })
            img_obj = Image(image=img, part_id=part_id)
            img_obj.save()
            img_serialized = ImageSerializer(img_obj,
                                             context={"request": request})
            logger.info(img_serialized.data)

            return JsonResponse({"status": "ok", "image": img_serialized.data})

    return JsonResponse({
        "status": "failed",
        "reason": "cannot find stream_id " + str(stream_id)
    })


@api_view()
def inference_video_feed(request, project_id):
    """Return inferenced video feed"""
    return JsonResponse({
        "status": "ok",
        "url": "http://" + inference_module_url() + "/video_feed?inference=1",
    })
