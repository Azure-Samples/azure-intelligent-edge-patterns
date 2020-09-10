# -*- coding: utf-8 -*-
"""App utilities.
"""

import json
import logging
import threading
import time

import requests
from django.utils import timezone

from ..azure_pd_deploy_status import progress as deploy_progress
from ..azure_pd_deploy_status.utils import upcreate_deploy_status
from ..azure_training_status.models import TrainingStatus
from .api.serializers import UpdateCamBodySerializer
from .models import PartDetection

logger = logging.getLogger(__name__)


def if_trained_then_deploy_worker(part_detection_id):
    """if_trained_then_deploy_worker.

    Args:
        part_detection_id:
    """

    # =====================================================
    # 1. Wait for project to be trained                 ===
    # =====================================================
    logger.info("Wait for project to be trained")
    part_detection_obj = PartDetection.objects.get(pk=part_detection_id)
    project_obj = part_detection_obj.project
    last_log = None
    while True:
        time.sleep(1)
        training_status_obj = TrainingStatus.objects.get(project=project_obj)
        logger.info("Listening on Training Status: %s", training_status_obj)
        if training_status_obj.status in ["ok", "failed"]:
            break
        if training_status_obj.log != last_log:
            upcreate_deploy_status(part_detection_id=part_detection_id,
                                   status=training_status_obj.status,
                                   log=training_status_obj.log)
            last_log = training_status_obj.log

    # =====================================================
    # 2. Project training failed                        ===
    # =====================================================
    if training_status_obj.status == "failed":
        logger.info("Project train/export failed.")
        upcreate_deploy_status(part_detection_id=part_detection_id,
                               status=training_status_obj.status,
                               log=training_status_obj.log)
        return

    # =====================================================
    # 2. Project training success                       ===
    # =====================================================
    logger.info("Project train/export success.")
    logger.info("Deploying model.")

    # =====================================================
    # 3. Deploy Model                                   ===
    # =====================================================
    part_detection_obj = PartDetection.objects.get(pk=part_detection_id)
    project_obj = part_detection_obj.project
    model_uri = project_obj.download_uri
    parts = [p.name for p in part_detection_obj.parts.all()]

    logger.info("Project model exported: %s", model_uri)
    logger.info("Preparing to deploy to inference module")
    logger.info("PartDetection is deployed before: %s",
                part_detection_obj.deployed)

    def deploy():
        requests.get(
            "http://" + str(part_detection_obj.inference_module.url) +
            "/update_part_detection_id",
            params={
                "part_detection_id": part_detection_obj.id,
            },
        )
        requests.get(
            "http://" + str(part_detection_obj.inference_module.url) +
            "/update_model",
            params={"model_uri": model_uri},
        )
        requests.get(
            "http://" + str(part_detection_obj.inference_module.url) +
            "/update_parts",
            params={"parts": parts},
        )
        update_cam_worker(part_detection_id=part_detection_obj.id)

    threading.Thread(target=deploy).start()

    # =====================================================
    # 4. Deployed! Saving                               ===
    # =====================================================
    part_detection_obj.deployed = True
    part_detection_obj.deploy_timestamp = timezone.now()
    part_detection_obj.has_configured = True
    part_detection_obj.save()
    logger.info("Project model Deployed !!!!!!")
    logger.info("Project model exported: %s", model_uri)
    logger.info("Preparing to deploy to inference module")
    logger.info("PartDetection is deployed before: %s",
                part_detection_obj.deployed)
    upcreate_deploy_status(part_detection_id=part_detection_id,
                           **deploy_progress.PROGRESS_0_OK)


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
