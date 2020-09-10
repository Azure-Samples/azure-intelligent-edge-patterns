"""views
"""

import logging
import sys
import threading
import time

from django.http import StreamingHttpResponse
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

from ...cameras.models import Camera
from ...general.api.swagger_schemas import StreamAutoSchema
from ..models import VideoFeed

logger = logging.getLogger(__name__)

STREAM_GC_TIME_THRESHOLD = 5  # Seconds
PRINT_STREAMS = True


class StreamManager():
    """StreamManager
    """

    def __init__(self):
        self.streams = []
        self.mutex = threading.Lock()
        self.gc()

    def add(self, stream: VideoFeed):
        """add stream
        """
        self.mutex.acquire()
        self.streams.append(stream)
        self.mutex.release()

    def get_stream_by_camera_id(self, camera_id):
        self.mutex.acquire()
        for stream in self.streams:
            if stream.camera_id == camera_id:
                stream.update_keep_alive()
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
                    logger.info('Stream %s elapse time: %s, Currnet time: %s',
                                index, stream.keep_alive, time.time())
                    if stream.keep_alive + STREAM_GC_TIME_THRESHOLD < time.time(
                    ):

                        # stop the inactive stream
                        # (the ones users didnt click disconnect)
                        logger.info('stream %s inactive', index)
                        stream.close()

                        # collect the stream, to delete later
                        to_delete.append(stream)

                for stream in to_delete:
                    self.streams.remove(stream)

                self.mutex.release()
                time.sleep(3)

        threading.Thread(target=_gc, args=(self,)).start()

    def keep_alive_(self):
        cnt = 0
        self.mutex.acquire()
        for stream in stream_manager.streams:
            cnt += 1
            stream.update_keep_alive()
        self.mutex.release()
        return cnt


if 'runserver' in sys.argv:
    stream_manager = StreamManager()


@swagger_auto_schema(auto_schema=StreamAutoSchema,
                     method='get',
                     operation_summary='Open a videofeed.',
                     manual_parameters=[
                         openapi.Parameter('camera_id',
                                           openapi.IN_QUERY,
                                           type=openapi.TYPE_STRING,
                                           description='camera_id'),
                     ])
@api_view(['GET'])
def video_feed(request):
    """videofeed.
    """

    camera_id = request.query_params.get("camera_id") or None
    try:
        Camera.objects.get(pk=camera_id)
    except Exception:
        raise NotFound(detail=f"camera_id: {camera_id} not found")
    stream = stream_manager.get_stream_by_camera_id(camera_id)
    if stream is None:
        stream = VideoFeed(camera_id)
        stream_manager.add(stream)

    return StreamingHttpResponse(
        stream.gen(), content_type="multipart/x-mixed-replace;boundary=frame")


@swagger_auto_schema(operation_summary='Keep a videofeed alive.', method='get')
@api_view(['GET'])
def keep_alive(request):
    """keep stream alive
    """

    logger.info("Keeping streams alive")

    cnt = stream_manager.keep_alive_()
    return Response({
        'status': 'ok',
        'detail': 'keep %s stream(s) alive' % cnt
    })
