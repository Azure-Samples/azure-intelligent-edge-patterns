import asyncio
import logging
import signal
import threading
import subprocess

import requests
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

app = FastAPI()


class Stream(BaseModel):
    url: str


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

RTSPSIM_PREFIX = "rtsp://rtspsim:554/media/upload/"


@app.post("/upload")
async def upload(stream: Stream):
    logger.warning("Uploading video: {}".format(stream.url))
    url = stream.url
    filename = 'test.mkv'
    # FIXME use your stream manager to fix it

    filename = download_file(url)
    if filename.startswith('invalid'):
        raise HTTPException(status_code=400, detail="invalid source")
    output_filename = upload_file(filename)

    return RTSPSIM_PREFIX+output_filename


def normalize_url(url):
    if '//' not in url:
        normalized_url = 'http://' + url
    return normalized_url


def download_file(url):
    local_filename = url.split('/')[-1]
    # NOTE the stream=True parameter below
    normalized_url = normalize_url(url)
    logger.warning('download link: {}'.format(normalized_url))
    with requests.get(normalized_url, stream=True) as r:
        if 'video' not in r.headers.get('content-type'):
            return 'invalid url'
        r.raise_for_status()
        with open(local_filename, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                # If you have chunk encoded response uncomment if
                # and set chunk_size parameter to None.
                # if chunk:
                f.write(chunk)

    return local_filename


def upload_file(filename):
    output_filename = filename.split('.')[0] + '.mkv'
    subprocess.run(["ffmpeg", "-i", filename, "-vcodec", "copy",
                    "-acodec", "copy",  "-an", output_filename, "-y"])
    subprocess.run(["cp", output_filename, "./upload/"])
    subprocess.run(["rm", filename])
    subprocess.run(["rm", output_filename])
    return output_filename


def main():
    uvicorn.run(app, host="0.0.0.0", port=7000)


if __name__ == "__main__":
    main()


# def handler(signum, frame):
#    global is_running
#    is_running = False
# loop = asyncio.get_event_loop()
# loop.add_signal_handler(signal.SIGINT, handler)
