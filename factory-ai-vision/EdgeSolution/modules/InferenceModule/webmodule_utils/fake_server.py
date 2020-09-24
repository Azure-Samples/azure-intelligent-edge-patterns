#!/usr/bin/env python
import json
import logging
import os
import sys

from flask import Flask, Response, request
from part_detections import PART_DETECTION_MODE_CHOICES

# sys.path.insert(0, '../lib')

logger = logging.getLogger(__name__)

MODEL_DIR = "model"
UPLOAD_INTERVAL = 1  # sec

DETECTION_TYPE_NOTHING = "nothing"
DETECTION_TYPE_SUCCESS = "success"
DETECTION_TYPE_UNIDENTIFIED = "unidentified"
DETECTION_BUFFER_SIZE = 10000

IMG_WIDTH = 960
IMG_HEIGHT = 540

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Main thread

app = Flask(__name__)


@app.route("/metrics", methods=["GET"])
def metrics():
    return json.dumps(
        {
            "success_rate": 0.0,
            "inference_num": 100,
            "unidentified_num": 100,
            "is_gpu": True,
            "average_inference_time": 0.1,
            "last_prediction_count": 10,
            "scenario_metrics": [{"name": "5566", "count": 5566}],
        }
    )


@app.route("/update_retrain_parameters")
def update_retrain_parameters():

    confidence_min = request.args.get("confidence_min")
    if not confidence_min:
        return "missing confidence_min"

    confidence_max = request.args.get("confidence_max")
    if not confidence_max:
        return "missing confidence_max"

    max_images = request.args.get("max_images")
    if not max_images:
        return "missing max_images"

    cam_id = request.args.get("cam_id")
    confidence_min = int(confidence_min) * 0.01
    confidence_max = int(confidence_max) * 0.01
    max_images = int(max_images)

    logger.info("Updaing retrain parameters to")
    logger.info("  cam_id: %s", cam_id)
    logger.info("  conficen_min: %s", confidence_min)
    logger.info("  conficen_max: %s", confidence_max)
    logger.info("  max_images: %s", max_images)

    return "ok"


@app.route("/update_model")
def update_model():

    model_uri = request.args.get("model_uri")
    model_dir = request.args.get("model_dir")
    if not model_uri and not model_dir:
        return "missing model_uri or model_dir"

    logger.info("Update Model ...")
    if model_uri:

        logger.info("Got Model URI %s", model_uri)
        logger.info("Update Finished ...")
        return "ok"

    elif model_dir:
        logger.info("Got Model DIR %s", model_dir)
        logger.info("Update Finished ...")
        return "ok"


@app.route("/update_cams", methods=["POST"])
def update_cams():
    """update_cams.

    Update multiple cameras at once.
    Cameras not in List should not inferecence.
    """
    data = request.get_json()
    logger.info(data["cameras"])
    logger.info(data)
    return "ok"


@app.route("/update_part_detection_mode")
def update_part_detection_mode():
    """update_part_detection_mode.
    """

    part_detection_mode = request.args.get("mode")
    if not part_detection_mode:
        return "missing part_detection_mode"

    if part_detection_mode not in PART_DETECTION_MODE_CHOICES:
        return "invalid part_detection_mode"
    logger.info(part_detection_mode)
    return "ok"


@app.route("/update_send_video_to_cloud")
def update_send_video_to_cloud():
    """update_part_detection_mode.
    """

    send_video_to_cloud = request.args.get("send_video_to_cloud")
    if not send_video_to_cloud:
        return "missing send_video_to_cloud"

    if send_video_to_cloud not in PART_DETECTION_MODE_CHOICES:
        return "invalid send_video_to_cloud"
    return "ok"


@app.route("/update_parts")
def update_parts():
    try:
        logger.info("----Upadate parts----")
        parts = request.args.getlist("parts")
        logger.info("Updating parts %s", parts)
        logger.info("Updated parts %s", parts)
    except:
        logger.error("Unknown format %s", parts)

    logger.info("onnx.update_parts %s", parts)

    return "ok"


@app.route("/update_iothub_parameters")
def update_iothub_parameters():
    is_send = request.args.get("is_send")
    threshold = request.args.get("threshold")
    fpm = request.args.get("fpm")

    if not is_send:
        return "missing is_send"
    if not threshold:
        return "missing threshold"
    if not fpm:
        return "missing fpm"

    is_send = is_send == "True"
    threshold = int(threshold) * 0.01
    fpm = int(fpm)

    logger.info("updating iothub parameters ...")
    logger.info("  is_send %s", is_send)
    logger.info("  threshold %s", threshold)
    logger.info("  fpm %s", fpm)

    cam_id = request.args.get("cam_id")
    logger.info("s.update_iothub_parameters(%s, %s, %s)", is_send, threshold, fpm)
    return "ok"


@app.route("/update_prob_threshold")
def update_prob_threshold():
    prob_threshold = request.args.get("prob_threshold")
    if not prob_threshold:
        return "missing prob_threshold"

    logger.info("Updating prob_threshold to")
    logger.info("  prob_threshold: %s", prob_threshold)

    return "ok"


@app.route("/update_fps")
def update_fps():
    """update_fps.
    """
    fps = request.args.get("fps")
    if not fps:
        return "missing fps"
    logger.info("Updating fps to %s", fps)
    return "ok"


def main():
    app.run(host="0.0.0.0", debug=False)
    # server.wait_for_termination()


if __name__ == "__main__":
    logging_level = logging.DEBUG if os.getenv("DEBUG") else logging.INFO

    # Set logging parameters
    logging.basicConfig(
        level=logging_level,
        format="[LVAX] [%(asctime)-15s] [%(threadName)-12.12s] [%(levelname)s]: %(message)s",
        handlers=[
            # logging.FileHandler(LOG_FILE_NAME),     # write in a log file
            logging.StreamHandler(sys.stdout)  # write in stdout
        ],
    )

    # Call Main logic
    main()
