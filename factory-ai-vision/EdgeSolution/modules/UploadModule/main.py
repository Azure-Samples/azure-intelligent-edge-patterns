import asyncio
import logging
import random
import re
import signal
import time
import threading
import subprocess
import requests_async as requests
# import requests
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi import status as fastapi_status
from pydantic import BaseModel

logger = logging.getLogger(__name__)

app = FastAPI()


class Stream(BaseModel):
    url: str


status = "ready"
to_upload = []
upload_id = 0


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


@app.get("/status")
async def upload_status():
    global status
    return status


is_running = True

RTSPSIM_PREFIX = "rtsp://rtspsim:554/media/upload/"


@app.post("/upload")
async def upload(stream: Stream):
    global status
    global to_upload
    status = "downloading"
    logger.warning("Uploading video: {}".format(stream.url))
    url = stream.url
    filename = 'test.mkv'
    # FIXME use your stream manager to fix it

    # add current download id to list
    upload_id = random.getrandbits(128)
    to_upload.append(upload_id)

    filename = await download_file(url, upload_id)
    if filename.startswith('invalid'):
        raise HTTPException(status_code=400, detail="invalid source")
    status = "uploading"

    if upload_id not in to_upload:
        raise HTTPException(status_code=400, detail="canceled")
        # response.status_code = fastapi_status.HTTP_301_MOVED_PERMANENTLY
        # return "canceled"

    output_filename = await asyncio.create_task(upload_file_async(filename, upload_id))
    print(output_filename)
    # output_filename = await upload_file(filename)
    status = "ready"

    if upload_id not in to_upload:
        raise HTTPException(status_code=400, detail="canceled")
        # response.status_code = fastapi_status.HTTP_301_MOVED_PERMANENTLY
        # return "canceled"

    return RTSPSIM_PREFIX+output_filename


@app.get("/cancel_upload")
async def canacel_upload():
    global to_upload
    to_upload.clear()
    # response.status_code = fastapi_status.HTTP_301_MOVED_PERMANENTLY
    return "ok"


def normalize_url(url):
    normalized_url = url
    if '//' not in url:
        normalized_url = 'http://' + url
    return normalized_url


async def download_file(url, upload_id):
    local_filename = url.split('/')[-1]
    # NOTE the stream=True parameter below
    normalized_url = normalize_url(url)
    logger.warning('download link: {}'.format(normalized_url))
    with await requests.get(normalized_url, stream=True) as r:
        if 'video' not in r.headers.get('content-type'):
            return 'invalid url'
        r.raise_for_status()
        with open(local_filename, 'wb') as f:
            async for chunk in r.iter_content(chunk_size=8192):
                # If you have chunk encoded response uncomment if
                # and set chunk_size parameter to None.
                # if chunk:
                f.write(chunk)

    return local_filename


async def upload_file(filename):
    output_filename = re.split(
        r"[-_|.+ %=]", filename.split('.')[0])[-1] + '.mkv'
    tmp_filename = re.split(
        r"[-_|.+ %=]", filename.split('.')[0])[-1] + '_tmp.mkv'
    if '.mkv' not in filename:
        subprocess.run(["ffmpeg", "-i", filename, tmp_filename, "-y"])
    else:
        subprocess.run(["cp", filename, tmp_filename])

    subprocess.run(["ffmpeg", "-i", tmp_filename, "-vcodec",
                    "copy", "-an", output_filename, "-y"])
    subprocess.run(["cp", output_filename, "./upload/"])
    subprocess.run(["rm", filename])
    subprocess.run(["rm", tmp_filename])
    subprocess.run(["rm", output_filename])
    return output_filename


async def upload_file_async(filename, upload_id):
    output_filename = re.split(
        r"[-_|.+ %=]", filename.split('.')[0])[-1] + '.mkv'
    tmp_filename = re.split(
        r"[-_|.+ %=]", filename.split('.')[0])[-1] + '_tmp.mkv'
    if '.mkv' not in filename:
        proc1 = await asyncio.create_subprocess_exec("ffmpeg", "-i", filename, tmp_filename, "-y")
        r1 = await proc1.wait()
    else:
        proc1 = await asyncio.create_subprocess_exec("cp", filename, tmp_filename)
        r1 = await proc1.wait()

    proc2 = await asyncio.create_subprocess_exec("ffmpeg", "-i", tmp_filename, "-vcodec",
                                                 "copy", "-an", output_filename, "-y")
    r2 = await proc2.wait()
    proc3 = await asyncio.create_subprocess_exec("cp", output_filename, "./upload/")
    r3 = await proc3.wait()
    proc4 = await asyncio.create_subprocess_exec("rm", filename, tmp_filename)
    r4 = await proc4.wait()
    if filename != output_filename:
        proc5 = await asyncio.create_subprocess_exec("rm", output_filename)
        r5 = await proc5.wait()
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
