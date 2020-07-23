"""
Stream views
"""

import datetime
import io
import threading
import logging
import time

from django.core.exceptions import ObjectDoesNotExist
from django.core.files.images import ImageFile
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ...azure_iot.utils import inference_module_url
from ...azure_parts.models import Part
from ...images.api.serializers import ImageSerializer
from ...images.models import Image
from ..models import Stream

logger = logging.getLogger(__name__)

# Stream Views
#
STREAM_GC_TIME_THRESHOLD = 5  # Seconds


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

import sys
if 'runserver' in sys.argv:
    stream_manager = StreamManager()


@api_view()
def connect_stream(request):
    """Connect to stream"""
    part_id = request.query_params.get("part_id")
    rtsp = request.query_params.get("rtsp") or "0"
    if part_id is None:
        s = Stream(rtsp, part_id=None)
        stream_manager.add(s)
        return Response({"status": "ok", "stream_id": s.id})

    try:
        Part.objects.get(pk=int(part_id))
        s = Stream(rtsp, part_id=int(part_id))
        stream_manager.add(s)
        return Response({"status": "ok", "stream_id": s.id})
    except ObjectDoesNotExist:
        return Response({"status": "failed", "reason": "part_id doesnt exist"})


@api_view()
def disconnect_stream(request, stream_id):
    """Disconnect from stream
    """

    stream = stream_manager.get_stream_by_id(stream_id)
    if stream:
        stream.close()
        return JsonResponse({'status': 'ok'})

    return Response({
        "status": "failed",
        "reason": "cannot find stream_id " + str(stream_id)
    })


def video_feed(request, stream_id):
    """video feed
    """

    stream = stream_manager.get_stream_by_id(stream_id)
    if stream:
        return StreamingHttpResponse(
            stream.gen(),
            content_type="multipart/x-mixed-replace;boundary=frame")

    return HttpResponse("<h1>Unknown Stream " + str(stream_id) + " </h1>")


@api_view()
def capture(request, stream_id):
    """Capture image
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
        if not part_id:
            return JsonResponse({
                "status": "failed",
                "reason": "neither Stream and capture request have part_id"
            })
        img_obj = Image(image=img, part_id=part_id)
        img_obj.save()
        img_serialized = ImageSerializer(img_obj, context={"request": request})
        logger.info(img_serialized.data)

        return Response({"status": "ok", "image": img_serialized.data})

    return Response({
        "status": "failed",
        "reason": "cannot find stream_id " + str(stream_id)
    })


@api_view()
def keep_alive(request, stream_id):
    """keep stream alive
    """

    logger.info("Keeping streams alive")
    stream = stream_manager.get_stream_by_id(stream_id)
    if stream:
        stream.update_keep_alive()
        return JsonResponse({'status': 'ok'})

    return JsonResponse({
        "status": "failed",
        "reason": "cannot find stream_id " + str(stream_id)
    })


@api_view()
def inference_video_feed(request, project_id):
    """inference_video_feed
    """

    return Response({
        "status": "ok",
        "url": "http://" + inference_module_url() + "/video_feed?inference=1",
    })
