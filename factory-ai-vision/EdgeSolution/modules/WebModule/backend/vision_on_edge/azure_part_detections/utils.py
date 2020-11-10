"""App utilities.
"""

import json
import logging
import threading
import time
import traceback

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
            upcreate_deploy_status(
                part_detection_id=part_detection_id,
                status=training_status_obj.status,
                log=training_status_obj.log,
            )
            last_log = training_status_obj.log

    # =====================================================
    # 2. Project training failed                        ===
    # =====================================================
    if training_status_obj.status == "failed":
        logger.info("Project train/export failed.")
        upcreate_deploy_status(
            part_detection_id=part_detection_id,
            status=training_status_obj.status,
            log=training_status_obj.log,
        )
        return

    # =====================================================
    # 2. Project training success                       ===
    # =====================================================
    logger.info("Project train/export success.")
    logger.info("Deploying...")

    # =====================================================
    # 3. Deploy Model and params                        ===
    # =====================================================
    try:
        deploy_worker(part_detection_id=part_detection_obj.id)
        logger.info("Part Detection successfully deployed to inference_module!")
    except Exception:
        logger.info("Part Detection deploy to inference_module failed !")

    # =====================================================
    # 4. Deployed! Saving                               ===
    # =====================================================
    part_detection_obj.deployed = True
    part_detection_obj.deploy_timestamp = timezone.now()
    part_detection_obj.has_configured = True
    part_detection_obj.save()

    logger.info("PartDetection is deployed before: %s", part_detection_obj.deployed)
    upcreate_deploy_status(
        part_detection_id=part_detection_id, **deploy_progress.PROGRESS_0_OK
    )


def deploy_worker(part_detection_id):
    """deploy.

    Args:
        part_detection_obj: Part Detection Objects
    """
    REQUEST_TIMEOUT = 60
    instance: PartDetection = PartDetection.objects.get(pk=part_detection_id)
    if not instance.has_configured:
        logger.error("This PartDetection is not configured")
        logger.error("Not sending any request to inference")
        return
    confidence_min = getattr(instance, "accuracyRangeMin", 30)
    confidence_max = getattr(instance, "accuracyRangeMax", 80)
    max_images = getattr(instance, "maxImages", 10)
    metrics_is_send_iothub = getattr(instance, "metrics_is_send_iothub", False)
    metrics_accuracy_threshold = getattr(instance, "metrics_accuracy_threshold", 50)
    metrics_frame_per_minutes = getattr(instance, "metrics_frame_per_minutes", 6)
    need_retraining = getattr(instance, "needRetraining", False)

    # =====================================================
    # 1. Update params                                  ===
    # =====================================================
    requests.get(
        "http://" + str(instance.inference_module.url) + "/update_part_detection_id",
        params={"part_detection_id": instance.id},
        timeout=REQUEST_TIMEOUT,
    )
    requests.get(
        "http://" + str(instance.inference_module.url) + "/update_part_detection_mode",
        params={"part_detection_mode": instance.inference_mode},
        timeout=REQUEST_TIMEOUT,
    )

    # =====================================================
    # 2. Update model                                  ===
    # =====================================================
    if not instance.project:
        pass
    elif instance.project.is_demo:
        requests.post(
            "http://" + str(instance.inference_module.url) + "/update_model",
            json={"model_dir": instance.project.download_uri},
            timeout=REQUEST_TIMEOUT,
        )

    elif not instance.inference_module.is_vpu():
        requests.post(
            "http://" + str(instance.inference_module.url) + "/update_model",
            json={"model_uri": instance.project.download_uri},
            timeout=REQUEST_TIMEOUT,
        )
    else:
        requests.post(
            "http://" + str(instance.inference_module.url) + "/update_model",
            json={"model_uri": instance.project.download_uri_fp16},
            timeout=REQUEST_TIMEOUT,
        )

    # =====================================================
    # 3. Update parts                                   ===
    # =====================================================
    logger.info("Update Parts!!!")
    parts = instance.parts.all()
    res_data = {"parts": []}

    for part in parts.all():
        res_data["parts"].append({"id": part.id, "name": part.name})
    requests.post(
        url="http://" + instance.inference_module.url + "/update_parts",
        json=res_data,
        timeout=REQUEST_TIMEOUT,
    )

    requests.get(
        "http://" + instance.inference_module.url + "/update_retrain_parameters",
        params={
            "is_retrain": need_retraining,
            "confidence_min": confidence_min,
            "confidence_max": confidence_max,
            "max_images": max_images,
        },
        timeout=REQUEST_TIMEOUT,
    )
    requests.get(
        "http://" + instance.inference_module.url + "/update_iothub_parameters",
        params={
            "is_send": metrics_is_send_iothub,
            "threshold": metrics_accuracy_threshold,
            "fpm": metrics_frame_per_minutes,
        },
        timeout=REQUEST_TIMEOUT,
    )

    # =====================================================
    # 4. Update cams                                    ===
    # =====================================================
    logger.info("Update Cam!!!")
    cameras = instance.cameras.all()
    res_data = {
        "fps": instance.fps,
        "lva_mode": instance.inference_protocol,
        "cameras": [],
    }

    for cam in cameras.all():
        if cam.area:
            res_data["cameras"].append(
                {
                    "id": cam.id,
                    "type": "rtsp",
                    "source": cam.rtsp,
                    "aoi": cam.area,
                    "lines": cam.lines,
                    "zones": cam.danger_zones,
                    "send_video_to_cloud": cam.cameratask_set.first().send_video_to_cloud,
                    "send_video_to_cloud_parts": [
                        {"id": part.id, "name": part.name}
                        for part in cam.cameratask_set.first().parts.all()
                    ],
                    "send_video_to_cloud_threshold": cam.cameratask_set.first().send_video_to_cloud_threshold,
                    "recording_duration": cam.cameratask_set.first().recording_duration,
                }
            )
        else:
            res_data["cameras"].append(
                {
                    "id": cam.id,
                    "type": "rtsp",
                    "source": cam.rtsp,
                    "lines": cam.lines,
                    "zones": cam.danger_zones,
                    "send_video_to_cloud": cam.cameratask_set.first().send_video_to_cloud,
                    "send_video_to_cloud_parts": [
                        {"id": part.id, "name": part.name}
                        for part in cam.cameratask_set.first().parts.all()
                    ],
                    "send_video_to_cloud_threshold": cam.cameratask_set.first().send_video_to_cloud_threshold,
                    "recording_duration": cam.cameratask_set.first().recording_duration,
                }
            )
    serializer = UpdateCamBodySerializer(data=res_data)
    serializer.is_valid(raise_exception=True)
    logger.info(serializer.validated_data)
    requests.post(
        url="http://" + instance.inference_module.url + "/update_cams",
        json=dict(serializer.validated_data),
        timeout=REQUEST_TIMEOUT,
    )
    # =====================================================
    # 5. Update prob_threshold                          ===
    # =====================================================
    requests.get(
        "http://" + instance.inference_module.url + "/update_prob_threshold",
        params={"prob_threshold": instance.prob_threshold},
        timeout=REQUEST_TIMEOUT,
    )


def if_trained_then_deploy_catcher(part_detection_id):
    """if_trained_then_deploy_catcher.

    Catch every exception when deploy.
    """
    try:
        if_trained_then_deploy_worker(part_detection_id=part_detection_id)
    except Exception:
        upcreate_deploy_status(
            part_detection_id=part_detection_id,
            status="failed",
            log=traceback.format_exc(),
            need_to_send_notification=True,
        )


# Helper here.


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
        **deploy_progress.PROGRESS_1_WATINING_PROJECT_TRAINED
    )
    threading.Thread(
        name="if_trained_then_deploy_catcher",
        target=if_trained_then_deploy_catcher,
        args=(part_detection_id,),
        daemon=True,
    ).start()


def deploy_all_helper(part_detection_id=None, instance: PartDetection = None) -> None:
    """deploy_helper.

    Deploy everything to inference in a thread.
    """
    if part_detection_id or instance:
        threading.Thread(
            name="deploy_all_helper",
            target=deploy_worker,
            args=(part_detection_id,),
            daemon=True,
        ).start()
