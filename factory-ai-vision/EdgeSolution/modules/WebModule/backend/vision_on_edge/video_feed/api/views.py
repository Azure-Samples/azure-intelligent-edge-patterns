"""views
"""

import logging
import sys
import threading
import time

from django.http import StreamingHttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..models import VideoFeed

logger = logging.getLogger(__name__)

STREAM_GC_TIME_THRESHOLD = 5  # Seconds


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
        self.streams.append(stream)

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


if 'runserver' in sys.argv:
    stream_manager = StreamManager()


@api_view()
def video_feed(request):
    """videofeed return
    """

    s = VideoFeed()
    stream_manager.add(s)

    return StreamingHttpResponse(
        s.gen(),
        content_type="multipart/x-mixed-replace;boundary=frame")


@api_view()
def keep_alive(request):
    """keep stream alive
    """

    logger.info("Keeping streams alive")
    cnt = 0
    for stream in stream_manager.streams:
        cnt += 1
        stream.update_keep_alive()
    return Response({'status': 'ok', 'detail': 'keep %s stream(s) alive' % cnt})
