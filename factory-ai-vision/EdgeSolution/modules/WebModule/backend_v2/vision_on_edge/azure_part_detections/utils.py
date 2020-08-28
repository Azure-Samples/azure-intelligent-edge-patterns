# -*- coding: utf-8 -*-
"""App Utilities
"""

import logging
import threading
import time

import requests

from ..azure_training_status.models import TrainingStatus
from ..general.utils import normalize_rtsp
from .models import PartDetection

logger = logging.getLogger(__name__)


def if_trained_then_deploy_worker(part_detection_id):

    while True:
        time.sleep(1)
        part_detection_obj = PartDetection.objects.get(pk=part_detection_id)
        project_obj = part_detection_obj.project
        training_status_obj = TrainingStatus.objects.get(project=project_obj)
        if training_status_obj.status not in ["ok", "failed"]:
            continue
        model_uri = project_obj.download_uri

        parts = [p.name for p in part_detection_obj.parts.all()]

        logger.info("Successfulling export model: %s", parts)
        logger.info("Preparing to deploy to inference")
        logger.info("Project is deployed before: %s",
                    part_detection_obj.deployed)
        if not part_detection_obj.deployed:

            def _send(download_uri, rtsp, parts):
                requests.get(
                    "http://" + str(part_detection_obj.inference_module.url) +
                    "/update_cam",
                    params={
                        "cam_type": "rtsp",
                        "cam_source": normalize_rtsp(rtsp)
                    },
                )
                requests.get(
                    "http://" + str(part_detection_obj.inference_module.url) +
                    "/update_model",
                    params={"model_uri": download_uri},
                )
                requests.get(
                    "http://" + str(part_detection_obj.inference_module.url) +
                    "/update_parts",
                    params={"parts": parts},
                )

            threading.Thread(target=_send,
                             args=(model_uri, part_detection_obj.camera.rtsp,
                                   parts)).start()

            part_detection_obj.deployed = True
            part_detection_obj.save()
            deploy_init = True
            continue

        part_detection_obj.has_configured = True
        part_detection_obj.save()
        break


def if_trained_then_deploy_helper(part_detection_id):
    """update_train_status.

    Open a thread to follow training status object.

    Args:
        project_id:
    """
    threading.Thread(target=if_trained_then_deploy_worker,
                     args=(part_detection_id,)).start()
