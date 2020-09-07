# -*- coding: utf-8 -*-
"""App utilities.
"""

import logging
import threading
import time
import json

import requests

from ..azure_pd_deploy_status import progress as deploy_progress
from ..azure_pd_deploy_status.utils import upcreate_deploy_status
from ..azure_training_status.models import TrainingStatus
from ..general.utils import normalize_rtsp
from .models import PartDetection
from .api.serializers import UpdateCamBodySerializer

logger = logging.getLogger(__name__)


def if_trained_then_deploy_worker(part_detection_id):
    """if_trained_then_deploy_worker.

    Args:
        part_detection_id:
    """

    while True:
        time.sleep(1)
        part_detection_obj = PartDetection.objects.get(pk=part_detection_id)
        project_obj = part_detection_obj.project
        training_status_obj = TrainingStatus.objects.get(project=project_obj)

        # Training Status Listener
        logger.info("Listening on Training Status: %s", training_status_obj)
        if training_status_obj.status not in ["ok", "failed"]:
            continue

        upcreate_deploy_status(
            part_detection_id=part_detection_id,
            **deploy_progress.PROGRESS_1_WATINING_PROJECT_TRAINED)
        model_uri = project_obj.download_uri
        parts = [p.name for p in part_detection_obj.parts.all()]

        logger.info("Project model exported: %s", model_uri)
        logger.info("Preparing to deploy to inference module")
        logger.info("PartDetection is deployed before: %s",
                    part_detection_obj.deployed)

        if not part_detection_obj.deployed:

            def _send(download_uri, rtsp, parts):
                requests.get(
                    "http://" + str(part_detection_obj.inference_module.url) +
                    "/update_part_detection_id",
                    params={
                        "part_detection_id": part_detection_obj.id,
                    },
                )  # TODO: Fix when multi camers
                # requests.get(
                # "http://" + str(part_detection_obj.inference_module.url) +
                # "/update_cam",
                # params={
                # "cam_type": "rtsp",
                # "cam_source": normalize_rtsp(rtsp)
                # },
                # )
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
                             args=(model_uri, part_detection_obj.cameras,
                                   parts)).start()

            part_detection_obj.deployed = True
            part_detection_obj.save()
            upcreate_deploy_status(part_detection_id=part_detection_id,
                                   **deploy_progress.PROGRESS_0_OK)
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
    part_detection_obj = PartDetection.objects.get(pk=part_detection_id)
    part_detection_obj.deployed = False
    part_detection_obj.save()
    upcreate_deploy_status(
        part_detection_id=part_detection_id,
        **deploy_progress.PROGRESS_1_WATINING_PROJECT_TRAINED)
    threading.Thread(target=if_trained_then_deploy_worker,
                     args=(part_detection_id,)).start()


def update_cam_worker(part_detection_id):
    """update_cam_worker
    """
    part_detection_obj = PartDetection.objects.get(pk=part_detection_id)
    cameras = part_detection_obj.cameras.all()
    inference_module = part_detection_obj.inference_module
    if inference_module is None:
        return
    inference_module_url = inference_module.url
    res_data = {"cameras": []}

    for cam in cameras.all():
        if cam.area:
            res_data["cameras"].append({
                "id": cam.id,
                "type": "rtsp",
                "source": cam.rtsp,
                "aoi": cam.area
            })
        else:
            res_data["cameras"].append({
                "id": cam.id,
                "type": "rtsp",
                "source": cam.rtsp,
            })
    serializer = UpdateCamBodySerializer(data=res_data)
    serializer.is_valid(raise_exception=True)
    requests.post(
        url="http://" + inference_module_url + "/update_cam",
        json=json.loads(json.dumps(serializer.validated_data)),
    )


def update_cam_helper(part_detection_id):
    """update_cam_worker
    """
    threading.Thread(target=update_cam_worker,
                     args=(part_detection_id,)).start()
