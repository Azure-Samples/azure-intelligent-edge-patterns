import asyncio
import signal
import threading

import cv2
import requests
from fastapi import FastAPI
from pydantic import BaseModel
from utility import get_inference_url

app = FastAPI()


class Stream(BaseModel):
    stream_id: str
    rtsp: str
    endpoint: str


@app.get("/")
async def index():
    # FIXME
    number_of_streams = 0
    return {"number_of_streams": number_of_streams}


@app.get("/streams/{stream_id}")
async def read_stream(stream_id):
    return {}


is_running = True


@app.post("/streams")
async def create_stream(stream: Stream):
    print("[INFO] Creating Stream", stream.stream_id)

    # FIXME use your stream manager to fix it
    def _new_streaming():
        endpoint = get_inference_url() + "/predict?cam_id" + stream.stream_id
        cap = cv2.VideoCapture(stream.rtsp)
        while is_running:
            is_ok, img = cap.read()
            if is_ok:
                jpg = cv2.imencode(".jpg", img)[1]
                files = {
                    "file": ("img", jpg),
                    "Content-Type": "image/jpeg",
                    "Content-Length": len(jpg),
                }
                # requests.post(endpoint, files=files)
                # print(jpg)
            else:
                break
        print("[INFO] stream finished")

    threading.Thread(target=_new_streaming, daemon=True).start()

    return {}


# def handler(signum, frame):
#    global is_running
#    is_running = False
# loop = asyncio.get_event_loop()
# loop.add_signal_handler(signal.SIGINT, handler)
