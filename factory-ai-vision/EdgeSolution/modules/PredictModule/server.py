"""PredictModule Server.
"""

import json
import logging
import logging.config
import os
import io
import socket
import sys
import threading
import time
from concurrent import futures
from typing import List

import cv2
import numpy as np
import uvicorn
import zmq
from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.responses import StreamingResponse

from api.models import (
    PartDetectionModeEnum,
    PartsModel,
    StreamModel,
    UploadModelBody,
)
from exception_handler import PrintGetExceptionDetails
from logging_conf import logging_config
from model_wrapper import ONNXRuntimeModelDeploy
from utility import is_edge

# sys.path.insert(0, '../lib')
# Set logging parameters

logger = logging.getLogger(__name__)

MODEL_DIR = "model"
UPLOAD_INTERVAL = 1  # sec

DETECTION_TYPE_NOTHING = "nothing"
DETECTION_TYPE_SUCCESS = "success"
DETECTION_TYPE_UNIDENTIFIED = "unidentified"
DETECTION_BUFFER_SIZE = 10000

IMG_WIDTH = 960
IMG_HEIGHT = 540

LVA_MODE = os.environ.get("LVA_MODE", "grpc")
IS_OPENCV = os.environ.get("IS_OPENCV", "false")

# Main thread

onnx = ONNXRuntimeModelDeploy()

app = FastAPI(
    title="PredictModule", description="Factory AI PredictModule.", version="0.0.1",
)


## FIXME ##
# injest to flask/fastapi context


def prediction(cam_id: str):
    """prediction."""
    # logger.info(onnx.last_prediction)
    # onnx.last_prediction
    stream = stream_manager.get_stream_by_id(cam_id)
    return json.dumps(stream.last_prediction)


@app.post("/predict")
async def predict(request: Request):
    """predict."""
    img_raw = await request.body()
    nparr = np.frombuffer(img_raw, np.uint8)
    if len(nparr) % 960 == 0:
        img = nparr.reshape(-1, 960, 3)
    else:
        img = nparr.reshape(540, -1, 3)
    # img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    predictions, inf_time = onnx.Score(img)
    results = customvision_to_lva_format(predictions)
    if int(time.time()) % 5 == 0:
        logger.info(predictions)

    return json.dumps({"inferences": results, "inf_time": inf_time}), 200
    # return json.dumps({"predictions": predictions, "inf_time": inf_time}), 200
    # return "", 204


@app.post("/predict2")
async def predict2(request: Request):
    """predict2."""
    reqBody = await request.body()
    # get request as byte stream

    # convert from byte stream
    inMemFile = io.BytesIO(reqBody)

    # load a sample image
    inMemFile.seek(0)
    fileBytes = np.asarray(bytearray(inMemFile.read()), dtype=np.uint8)

    cvImage = cv2.imdecode(fileBytes, cv2.IMREAD_COLOR)

    predictions, inf_time = onnx.Score(cvImage)
    results = customvision_to_lva_format(predictions)
    if int(time.time()) % 5 == 0:
        logger.info(predictions)

    return json.dumps({"inferences": results, "inf_time": inf_time}), 200


@app.post("/update_model")
def update_model(request_body: UploadModelBody):
    """update_model."""

    if not request_body.model_uri and not request_body.model_dir:
        return "missing model_uri or model_dir", 400

    model_uri = request_body.model_uri
    model_dir = request_body.model_dir

    logger.info("Updating Model ...")
    if request_body.model_uri:

        logger.info("Got Model URI %s", request_body.model_uri)

        # FIXME webmodule didnt send set detection_mode as Part Detection sometimes.
        # workaround
        onnx.set_detection_mode("PD")
        onnx.set_is_scenario(False)

        if model_uri == onnx.model_uri:
            logger.info("Model Uri unchanged.")
            onnx.update_model("model")
            return "ok", 200
        if onnx.model_downloading:
            logger.info("Already have a thread downloading project.")
            return "Already downloading model", 400
        onnx.model_uri = model_uri
        # TODO: use background task
        # background_tasks.add_task(
        # onnx.download_and_update_model, request_body.model_uri, MODEL_DIR
        # )
        onnx.download_and_update_model(model_uri, MODEL_DIR)
        # onnx.model_downloaded = False
        # get_file_zip(model_uri, MODEL_DIR)
        # onnx.model_downloaded = True
        logger.info("Downloading in background ...")
        return "ok"

    if request_body.model_dir:
        logger.info("Got Model DIR %s", request_body.model_dir)
        onnx.set_is_scenario(True)
        onnx.update_model(request_body.model_dir)
        logger.info("Update Finished ...")
        return "ok"


@app.get("/get_device")
def get_device():
    device = onnx.get_device()
    return {"device": device}


def customvision_to_lva_format(predictions):
    results = []
    for prediction in predictions:
        tag_name = prediction["tagName"]
        confidence = prediction["probability"]
        box = {
            "l": prediction["boundingBox"]["left"],
            "t": prediction["boundingBox"]["top"],
            "w": prediction["boundingBox"]["width"],
            "h": prediction["boundingBox"]["height"],
        }
        results.append(
            {
                "type": "entity",
                "entity": {
                    "tag": {"value": tag_name, "confidence": confidence},
                    "box": box,
                },
            }
        )
    return(results)


def lva_to_customvision_format(predictions):
    results = []
    for prediction in predictions:
        tagName = prediction['entity']['tag']['value']
        probability = prediction['entity']['tag']['confidence']
        boundingBox = {
            "left": prediction['entity']['box']['l'],
            "top": prediction['entity']['box']['t'],
            "width": prediction['entity']['box']['w'],
            "hetght": prediction['entity']['box']['h'],
        }
        results.append(
            {
                "tagName": tagName,
                "probability": probability,
                "boundingBox": boundingBox,
            }
        )
    return(results)


def local_main():
    """local_main.

    For local development.
    """
    uvicorn.run(app, host="0.0.0.0", port=7777)


def main():
    """main.

    Main loop.
    """
    try:
        uvicorn.run(app, host="0.0.0.0", port=7777)

    except:
        PrintGetExceptionDetails()
        raise
        # exit(-1)


if __name__ == "__main__":
    import logging.config

    if os.getenv("PRODUCTION"):
        logging.config.dictConfig(logging_config.LOGGING_CONFIG_PRODUCTION)
    else:
        logging.config.dictConfig(logging_config.LOGGING_CONFIG_DEV)

    logger.info("is_edge: %s", is_edge())
    if is_edge():
        main()
    else:
        logger.info("Assume running at local development.")
        local_main()
