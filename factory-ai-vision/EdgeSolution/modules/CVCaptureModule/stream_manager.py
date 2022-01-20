import logging
import threading

import zmq
from streams import Stream

# FIXME RON

logger = logging.getLogger(__name__)
# logger.setLevel(logging.INFO)


class StreamManager(object):
    def __init__(self):
        self.streams = {}
        self.mutex = threading.Lock()
        self.context = None
        self.sender = None
        self._init_zmq()

    def _init_zmq(self):

        self.context = zmq.Context()
        self.sender = self.context.socket(zmq.PUB)
        self.sender.bind("tcp://*:5556")

    def _add_new_stream(self, stream_id, rtsp, fps, endpoint):
        """ internal function, no thread protect """
        logger.info("Add new stream: %s", stream_id)

        if stream_id in self.streams:
            logger.warning("Stream %s already existed", stream_id)
            return False

        # FIXME RON check this
        stream = Stream(stream_id, rtsp, fps, endpoint, self.sender)
        self.streams[stream_id] = stream

    def get_streams(self):
        self.mutex.acquire()
        streams = list(self.streams.values())
        self.mutex.release()
        return streams

    def get_streams_num_danger(self):
        return len(self.streams)

    def get_streams_danger(self):
        streams = list(self.streams.values())
        return streams

    def delete_stream(self, stream_id):
        self._delete_stream_by_id(stream_id)

    def add_stream(self, stream_id, rtsp, fps, endpoint):
        self.mutex.acquire()
        if stream_id in self.streams:
            s = self.streams.get(stream_id, None)
            if s.check_update(rtsp, fps, endpoint):
                self._delete_stream_by_id(stream_id)
            else:
                print("nothing change")

        self._add_new_stream(stream_id, rtsp, fps, endpoint)
        self.mutex.release()

        return "ok"

    def update_streams(self, stream_id):
        self.mutex.acquire()

        for stream in self.streams.values():
            stream.reset_metrics()

        origin_stream_ids = list([stream_id for stream_id in self.streams])

        logger.info("==== Update Streams ====")
        logger.info("origin: %s", origin_stream_ids)
        logger.info("new   : %s", stream_ids)

        to_delete = []
        to_update = []
        for stream_id in origin_stream_ids:
            if stream_id not in stream_ids:
                to_delete.append(stream_id)
                to_update.append(stream_id)

        to_add = []
        for stream_id in stream_ids:
            if (stream_id in stream_ids) and (stream_id not in origin_stream_ids):
                to_add.append(stream_id)

        logger.info("To Delete : %s", to_delete)
        logger.info("To Add    : %s", to_add)

        for stream_id in to_delete:
            # FIXME
            # Need to be deleted elegantly
            self._delete_stream_by_id(stream_id)

        for stream_id in to_add:
            self._add_new_stream(stream_id)

        self.mutex.release()

    def get_stream_by_id_danger(self, stream_id):
        stream = self.streams.get(stream_id, None)
        return stream

    def get_stream_by_id(self, stream_id):
        self.mutex.acquire()
        if stream_id not in self.streams:
            self.mutex.release()
            logger.warning("Cannot find stream: %s", stream_id)
            return None
        stream = self.streams[stream_id]
        self.mutex.release()
        logger.info("Got stream: %s", stream_id)
        return stream

    def _delete_stream_by_id(self, stream_id):
        """ internal function, no thread protect """
        logger.info("Deleting stream: %s", stream_id)
        if stream_id not in self.streams:
            logger.warning("Cannot find stream: %s", stream_id)
            return False
        # FIXME need to fix this
        # FIXME  RON
        self.streams[stream_id].delete()
        del self.streams[stream_id]
        logger.info("Deleted stream: %s", stream_id)
        return True

    def summary(self):
        self.mutex.acquire()
        logger.info("==== Stream Manager Summary ====")
        for stream_id, stream in self.streams.items():
            logger.info("Stream: %s", stream_id)
        self.mutex.release()


if __name__ == "__main__":

    class Stream:
        def __init__(self, stream_id, model, sender):
            self.model = model
            self.sender = sender

        def delete(self):
            pass

    sm = StreamManager("model")
    sm.update_streams([1, 2])
    sm.update_streams([2, 3])
    sm.update_streams([1, 3])
    sm.update_streams([1, 3])
    sm.summary()
