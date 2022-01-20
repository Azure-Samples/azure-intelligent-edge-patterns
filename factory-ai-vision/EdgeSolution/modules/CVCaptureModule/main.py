import asyncio
import logging
import signal
import threading

import cv2
import requests
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from stream_manager import StreamManager

logger = logging.getLogger(__name__)
stream_manager = StreamManager()

app = FastAPI()


class Stream(BaseModel):
    stream_id: str
    rtsp: str
    fps: float
    endpoint: str


@app.get("/")
async def index():
    # FIXME
    number_of_streams = 0
    infos = []
    for stream in stream_manager.get_streams():
        infos.append(
            {
                "cam_id": stream.cam_id,
                "cam_source": stream.cam_source,
                "fps": stream.fps,
            }
        )
    return {"number_of_streams": number_of_streams, "infos": infos}


@app.get("/delete_stream/{stream_id}")
async def delete_stream(stream_id):
    stream_manager.delete_stream(stream_id)
    logger.info("Delete stream {}".format(stream_id))

    return "ok"


@app.get("/streams/{stream_id}")
async def read_stream(stream_id):
    return {}


is_running = True

RTSPSIM_PREFIX = "rtsp://rtspsim:554/media"


@app.post("/streams")
async def create_stream(stream: Stream):
    print("[INFO] Creating Stream", stream.stream_id)
    rtsp = stream.rtsp
    if rtsp.startswith(RTSPSIM_PREFIX) and '/upload/' not in rtsp:
        rtsp = "videos" + rtsp.split(RTSPSIM_PREFIX)[1]
    stream_manager.add_stream(stream.stream_id, rtsp,
                              stream.fps, stream.endpoint)

    # FIXME use your stream manager to fix it

    return {}


def main():
    uvicorn.run(app, host="0.0.0.0", port=9000)


if __name__ == "__main__":
    main()


# def handler(signum, frame):
#    global is_running
#    is_running = False
# loop = asyncio.get_event_loop()
# loop.add_signal_handler(signal.SIGINT, handler)
