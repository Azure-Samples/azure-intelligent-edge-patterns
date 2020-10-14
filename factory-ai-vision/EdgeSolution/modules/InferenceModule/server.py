"""Server.
"""

import json
import logging
import logging.config
import os
import socket
import sys
import threading
import time
from concurrent import futures
from typing import List

import cv2
import grpc
import numpy as np
import uvicorn
import zmq
from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.responses import StreamingResponse

import extension_pb2_grpc
from api.models import (
    CamerasModel,
    PartDetectionModeEnum,
    PartsModel,
    StreamModel,
    UploadModelBody,
)
from arguments import ArgumentParser, ArgumentsType
from exception_handler import PrintGetExceptionDetails
from http_inference_engine import HttpInferenceEngine
from inference_engine import InferenceEngine
from invoke import gm
from logging_conf import logging_config
from model_wrapper import ONNXRuntimeModelDeploy
from stream_manager import StreamManager
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
stream_manager = StreamManager(onnx)

app = FastAPI(
    title="InferenceModule", description="Factory AI InferenceModule.", version="0.0.1",
)


## FIXME ##
# injest to flask/fastapi context
http_inference_engine = HttpInferenceEngine(stream_manager)


@app.get("/streams")
def streams() -> List[StreamModel]:
    """streams."""
    # logger.info(onnx.last_prediction)
    # onnx.last_prediction
    return [stream.to_api_model() for stream in stream_manager.streams.values()]


@app.get("/prediction")
def prediction(cam_id: str):
    """prediction."""
    # logger.info(onnx.last_prediction)
    # onnx.last_prediction
    stream = stream_manager.get_stream_by_id(cam_id)
    return json.dumps(stream.last_prediction)


@app.post("/predict")
async def predict(camera_id: str, request: Request):
    """predict."""
    img_raw = await request.body()
    nparr = np.frombuffer(img_raw, np.uint8)
    img = nparr.reshape(960, -1, 3)
    # img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    results = http_inference_engine.predict(camera_id, img)

    if len(results) > 0:
        return json.dumps({"inferences": results}), 200
    return "", 204


@app.get("/metrics")
def metrics(cam_id: str):
    """metrics."""
    inference_num = 0
    unidentified_num = 0
    total = 0
    success_rate = 0
    average_inference_time = 0
    last_prediction_count = {}
    is_gpu = onnx.is_gpu
    scenario_metrics = []

    stream = stream_manager.get_stream_by_id_danger(cam_id)
    if stream:
        last_prediction_count = {}
        inference_num = stream.detection_success_num
        unidentified_num = stream.detection_unidentified_num
        total = stream.detection_total
        average_inference_time = stream.average_inference_time
        last_prediction_count = stream.last_prediction_count
        scenario_metrics = stream.get_scenario_metrics()
        if total == 0:
            success_rate = 0
        else:
            success_rate = inference_num * 100 / total
    return {
        "success_rate": success_rate,
        "inference_num": inference_num,
        "unidentified_num": unidentified_num,
        "is_gpu": is_gpu,
        "average_inference_time": average_inference_time,
        "last_prediction_count": last_prediction_count,
        "scenario_metrics": scenario_metrics,
    }


@app.get("/update_part_detection_id")
def update_part_detection_id(part_detection_id: int):
    """update_part_detection_id."""
    return "ok"


@app.get("/update_retrain_parameters")
def update_retrain_parameters(
    is_retrain: bool, confidence_min: int, confidence_max: int, max_images: int
):
    """update_retrain_parameters."""

    # FIXME currently set all streams
    # cam_id = request.args.get('cam_id')
    # s = stream_manager.get_stream_by_id(cam_id)
    confidence_min = int(confidence_min) * 0.01
    confidence_max = int(confidence_max) * 0.01
    max_images = int(max_images)
    for stream in stream_manager.get_streams():
        stream.update_retrain_parameters(
            is_retrain, confidence_min, confidence_max, max_images
        )

    # FIXME will need to show it for different stream
    logger.info("Updating retrain parameters to")
    logger.info("  confidecen_min: %s", confidence_min)
    logger.info("  confidecen_max: %s", confidence_max)
    logger.info("  max_images  : %s", max_images)

    return "ok"


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


@app.post("/update_cams")
def update_cams(request_body: CamerasModel):
    """update_cams.

    Update multiple cameras at once.
    Cameras not in List should not inferecence.
    """
    logger.info(request_body)
    fps = request_body.fps
    stream_manager.update_streams([cam.id for cam in request_body.cameras])
    n = stream_manager.get_streams_num_danger()
    # frame_rate = onnx.update_frame_rate_by_number_of_streams(n)
    # recommended_fps = onnx.get_recommended_frame_rate(n)
    frame_rate = fps
    onnx.set_frame_rate(fps)

    # lva_mode

    if request_body.lva_mode:
        lva_mode = request_body.lva_mode
        onnx.set_lva_mode(lva_mode)
    else:
        lva_mode = onnx.lva_mode

    for cam in request_body.cameras:
        cam_type = cam.type
        cam_source = cam.source
        cam_id = cam.id
        # TODO: IF onnx.part_detection_mode == "PC" (PartCounting), use lines to count
        line_info = cam.lines
        zone_info = cam.zones

        if cam.aoi:
            aoi = json.loads(cam.aoi)
            has_aoi = aoi["useAOI"]
            aoi_info = aoi["AOIs"]
            logger.info("aoi information")
        else:
            has_aoi = False
            aoi_info = None

        logger.info("Updating camera %s", cam_id)
        stream = stream_manager.get_stream_by_id(cam_id)
        # s.update_cam(cam_type, cam_source, cam_id, has_aoi, aoi_info, cam_lines)
        # FIXME has_aoi
        stream.update_cam(
            cam_type,
            cam_source,
            frame_rate,
            lva_mode,
            cam_id,
            has_aoi,
            aoi_info,
            onnx.detection_mode,
            line_info,
            zone_info,
        )
        stream.send_video_to_cloud = cam.send_video_to_cloud

    logger.info("Streams %s", stream_manager.streams)
    return "ok"


@app.get("/update_part_detection_mode")
def update_part_detection_mode(part_detection_mode: PartDetectionModeEnum):
    """update_part_detection_mode."""

    onnx.set_detection_mode(part_detection_mode.value)
    return "ok"


@app.post("/update_parts")
def update_parts(parts: PartsModel):
    """update_parts."""
    try:
        logger.info("Updating parts...")
        part_names = [part.name for part in parts.parts]
        logger.info("Parts: %s", part_names)
        # FIXME: Save the part id and use part id to relabel
        onnx.parts = part_names
        logger.info("Update parts success.")
    except Exception:
        logger.error("Update parts failed...")
        # return 'unknown format'

    onnx.update_parts(part_names)

    return "ok"


@app.get("/update_iothub_parameters")
def update_iothub_parameters(is_send: bool, threshold: int, fpm: int):
    """update_iothub_parameters."""

    threshold = threshold * 0.01

    logger.info("Updating iothub parameters ...")
    logger.info("  is_send  : %s", is_send)
    logger.info("  threshold: %s", threshold)
    logger.info("  fpm      : %s", fpm)

    # FIXME currently set all streams
    # cam_id = request.args.get('cam_id')
    # s = stream_manager.get_stream_by_id(cam_id)
    for stream in stream_manager.get_streams():
        stream.update_iothub_parameters(is_send, threshold, fpm)
    return "ok"


@app.get("/status")
def get_scenario():
    """get_scenario."""
    streams_status = []
    for stream in stream_manager.get_streams():
        streams_status.append(
            {
                "cam_id": stream.cam_id,
                "stream_id": stream.cam_id,
                "cam_source": stream.cam_source,
                "cam_is_alive": stream.cam_is_alive,
                "confidence_min": stream.confidence_min,
                "confidence_max": stream.confidence_max,
                "max_images": stream.max_images,
                "threshold": stream.threshold,
                "has_aoi": stream.has_aoi,
                "is_retrain": stream.is_retrain,
            }
        )
    return {
        "num_streams": len(stream_manager.streams),
        "stream_ids": list(stream_manager.streams.keys()),
        "streams_status": streams_status,
        "parts": onnx.parts,
        "scenario": onnx.detection_mode,
    }


@app.get("/update_prob_threshold")
def update_prob_threshold(prob_threshold: int):
    """update_prob_threshold."""

    logger.info("Updating prob_threshold to")
    logger.info("  prob_threshold: %s", prob_threshold)

    for stream in stream_manager.get_streams():
        stream.threshold = int(prob_threshold) * 0.01
        logger.info("Updating")
        # s.detection_success_num = 0
        # s.detection_unidentified_num = 0
        # s.detection_total = 0
        # s.detections = []
        stream.reset_metrics()

    return "ok"


@app.get("/get_recommended_fps")
def get_recommended_fps(number_of_cameras: int):
    """get_recommended_fps.

    Args:
        number_of_cameras (int): number_of_cameras
    """
    return onnx.get_recommended_frame_rate(number_of_cameras)


# @app.route("/get_current_fps")
# def get_current_fps():
# """get_current_fps.
# """
# return onnx.frame_rate


@app.get("/update_lva_mode")
def update_lva_mode(lva_mode: str):
    """update_lva_mode."""
    logger.info("Updating lva_mode...")

    for s in stream_manager.get_streams():
        s.update_lva_mode(lva_mode)


@app.get("/update_fps")
def update_fps(fps: int):
    """update_fps."""
    logger.info("Updating fps")
    logger.info("  fps: %s", fps)
    return "ok"


class DisplayManager:
    def __init__(self):
        self.diplay_ids = []

    def keep_alive(self, cam_id):
        display = self.display_cam_ids.get(cam_id)
        display["last_alive"] = time.time()


@app.get("/video_feed")
async def video_feed(cam_id: str):
    stream = stream_manager.get_stream_by_id(cam_id)
    if stream:
        print("[INFO] Preparing Video Feed for stream %s" % cam_id, flush=True)
        stream.last_display_keep_alive = time.time()
        return StreamingResponse(
            stream.gen(), media_type="multipart/x-mixed-replace; boundary=frame"
        )
    else:
        print("[Warning] Cannot find stream %s" % cam_id, flush=True)
        return "failed"


@app.get("/video_feed/keep_alive")
async def keep_alive(cam_id: str):
    stream = stream_manager.get_stream_by_id(cam_id)
    if stream:
        print("[INFO] Keep Alive for stream %s" % cam_id, flush=True)
        stream.update_display_keep_alive()
    else:
        print("[Warning] Cannot find stream %s" % cam_id)
        return "failed"


def init_topology():
    """init_topology.

    Init LVA topologies
    """

    instances = gm.invoke_graph_instance_list()
    if instances["status"] != 200:
        logger.warning("Failed to invoker direct method: %s", instances["payload"])
        return -1
    logger.info(
        "========== Deleting %s instance(s) ==========",
        len(instances["payload"]["value"]),
    )

    for i in range(len(instances["payload"]["value"])):
        gm.invoke_graph_instance_deactivate(instances["payload"]["value"][i]["name"])
        gm.invoke_graph_instance_delete(instances["payload"]["value"][i]["name"])

    topologies = gm.invoke_graph_topology_list()
    if instances["status"] != 200:
        logger.warning("Failed to invoker direct method: %s", instances["payload"])
        return -1
    logger.info(
        "========== Deleting %s topology ==========",
        len(topologies["payload"]["value"]),
    )

    for i in range(len(topologies["payload"]["value"])):
        gm.invoke_graph_topology_delete(topologies["payload"]["value"][i]["name"])

    logger.info("========== Setting default grpc/http topology ==========")
    ret = gm.invoke_topology_set("grpc")
    ret = gm.invoke_topology_set("http")

    return 1


def local_main():
    """local_main.

    For local development.
    """
    uvicorn.run(app, host="0.0.0.0", port=5000)


def benchmark():
    """benchmark."""
    # app.run(host='0.0.0.0', debug=False)
    # s.update_cam(cam_type, cam_source, frame_rate, cam_id, has_aoi, aoi_info,
    SAMPLE_VIDEO = "./sample_video/video.mp4"
    SCENARIO1_MODEL = "scenario_models/1"

    n_threads = 3
    n_images = 100
    logger.info("============= BenchMarking (Begin) ==================")
    logger.info("--- Settings ----")
    logger.info("%s threads", n_threads)
    logger.info("%s images", n_images)

    stream_ids = list(str(i) for i in range(n_threads))
    stream_manager.update_streams(stream_ids)
    onnx.set_is_scenario(True)
    onnx.update_model(SCENARIO1_MODEL)
    for s in stream_manager.get_streams():
        s.set_is_benchmark(True)
        s.update_cam("video", SAMPLE_VIDEO, 30, s.cam_id, False, None, "PC", [], [])

    def _f():
        logger.info("--- Thread %s started---", threading.current_thread())
        t0_t = time.time()
        img = cv2.imread("img.png")
        for i in range(n_images):
            s.predict(img)
        t1_t = time.time()
        print("---- Thread", threading.current_thread(), "----", flush=True)
        print("Processing", n_images, "images in", t1_t - t0_t, "seconds", flush=True)
        print("  Avg:", (t1_t - t0_t) / n_images * 1000, "ms per image", flush=True)

    threads = []
    for i in range(n_threads):
        threads.append(threading.Thread(target=_f))
    t0 = time.time()
    for i in range(n_threads):
        threads[i].start()
    for i in range(n_threads):
        threads[i].join()
    t1 = time.time()
    # print(t1-t0)
    logger.info("---- Overall ----")
    logger.info("Processing %s images in %s seconds", n_images * n_threads, t1 - t0)
    logger.info("  Avg: %s ms per image", (t1 - t0) / (n_images * n_threads) * 1000)
    logger.info("============= BenchMarking (End) ==================")


def cvcapture_url():
    if is_edge():
        ip = socket.gethostbyname("CVCaptureModule")
        return "tcp://" + ip + ":5556"
    return "tcp://localhost:5556"


def opencv_zmq():
    context = zmq.Context()
    receiver = context.socket(zmq.SUB)
    receiver.setsockopt(zmq.SUBSCRIBE, bytes("", "utf-8"))
    receiver.connect(cvcapture_url())
    cnt = {}

    def run():
        while True:
            buf = receiver.recv_multipart()

            if buf[0] not in cnt.keys():
                cnt[buf[0]] = 1
            else:
                cnt[buf[0]] += 1
            logger.info(
                "receiving from channel {}, cnt: {}".format(buf[0], cnt[buf[0]])
            )
            stream = stream_manager.get_stream_by_id(buf[0].decode("utf-8"))
            logger.info(buf[0])
            if not stream:
                predicitons = []
                logger.info("Stream not ready yet.")
                continue
            try:
                nparr = np.frombuffer(buf[1], np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                stream.predict(img)
                predictions = stream.last_prediction
                logger.info("Predictions %s", predictions)
            except:
                logger.error("Unexpected error: %s", sys.exc_info())
        receiver.close()

    threading.Thread(target=run).start()


def main():
    """main.

    Main loop.
    """
    try:
        # Get application arguments
        argument_parser = ArgumentParser(ArgumentsType.SERVER)

        if IS_OPENCV == "false":
            # Get port number
            grpcServerPort = argument_parser.GetGrpcServerPort()
            logger.info("gRPC server port: %s", grpcServerPort)

            # init graph topology & instance
            counter = 0
            while init_topology() == -1:
                if counter == 100:
                    logger.critical(
                        "Failed to init topology, please check whether direct method still works"
                    )
                    sys.exit(-1)
                logger.warning("Failed to init topology, try again 10 secs later")
                time.sleep(10)
                counter += 1

            # create gRPC server and start running
            server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
            extension_pb2_grpc.add_MediaGraphExtensionServicer_to_server(
                InferenceEngine(stream_manager), server
            )
            server.add_insecure_port(f"[::]:{grpcServerPort}")
            server.start()
        else:
            logger.info("opencv server")
            # opencv_zmq()
        uvicorn.run(app, host="0.0.0.0", port=5000)
        # server.wait_for_termination()

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
        # benchmark()
