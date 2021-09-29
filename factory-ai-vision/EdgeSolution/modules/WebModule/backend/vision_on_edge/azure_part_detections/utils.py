"""App utilities.
"""

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
from .models import PartDetection, PDScenario

logger = logging.getLogger(__name__)


def if_trained_then_deploy_worker(part_detection_id):
    """if_trained_then_deploy_worker.

    Args:
        part_detection_id:
    """
    # if no download_uri -> first training -> wait for training (1. ~ 2.)
    # others -> deploy the latest trained model (from 3.)
    part_detection_obj = PartDetection.objects.get(pk=part_detection_id)
    project_obj = part_detection_obj.project

    # =====================================================
    # 1. Wait for project to be trained                 ===
    # =====================================================
    if project_obj.download_uri:
        logger.warning('Deploy the latest trained model')
    else:
        logger.info("Wait for project to be trained")
        last_log = None
        while True:
            time.sleep(1)
            training_status_obj = TrainingStatus.objects.get(project=project_obj)
            logger.info("Listening on Training Status: %s", training_status_obj)
            if training_status_obj.status in ["ok", "Failed"]:
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
        if training_status_obj.status == "Failed":
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
    counting_start_time = getattr(instance, "counting_start_time", "")
    counting_end_time = getattr(instance, "counting_end_time", "")

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
    # 2.1 Update endpoint                               ===
    # =====================================================
    if instance.deployment_type == 'cascade':
        requests.post(
            "http://" + str(instance.inference_module.url) + "/update_endpoint",
            json={
                "endpoint": "ovmsserver:9001",
                "headers": "",
                "pipeline": instance.cascade.flow,
            },
            timeout=REQUEST_TIMEOUT,
        ) 
    else:
        requests.post(
            "http://" + str(instance.inference_module.url) + "/update_endpoint",
            json={
                "endpoint": instance.project.get_prediction_uri(),
                "headers": instance.project.prediction_header,
            },
            timeout=REQUEST_TIMEOUT,
        )

    # =====================================================
    # 2.2 Update model                                  ===
    # =====================================================
    # if not instance.project:
    #     pass
    # elif instance.project.is_demo:
    #     requests.post(
    #         "http://" + str(instance.inference_module.url) + "/update_model",
    #         json={"model_dir": instance.project.download_uri},
    #         timeout=REQUEST_TIMEOUT,
    #     )

    # elif not instance.inference_module.is_vpu():
    #     requests.post(
    #         "http://" + str(instance.inference_module.url) + "/update_model",
    #         json={"model_uri": instance.project.download_uri},
    #         timeout=REQUEST_TIMEOUT,
    #     )
    # else:
    #     requests.post(
    #         "http://" + str(instance.inference_module.url) + "/update_model",
    #         json={"model_uri": instance.project.download_uri_fp16},
    #         timeout=REQUEST_TIMEOUT,
    #     )

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
        cam_info = {
            "id": cam.id,
            "name": cam.name,
            "type": "rtsp",
            "source": cam.rtsp,
            "lines": cam.lines,
            "zones": cam.danger_zones,
            "send_video_to_cloud": cam.cameratask_set.first().send_video_to_cloud,
            "send_video_to_cloud_parts": [
                {"id": part.id, "name": part.name}
                for part in cam.cameratask_set.first().parts.all()
            ],
            "send_video_to_cloud_threshold": cam.cameratask_set.first().send_video_to_cloud_threshold,  # noqa: E501
            "recording_duration": cam.cameratask_set.first().recording_duration,  # noqa: E501
            "enable_tracking": cam.cameratask_set.first().enable_tracking,
            "counting_start_time": counting_start_time,
            "counting_end_time": counting_end_time,
        }
        if cam.area:
            cam_info["aoi"] = cam.area
        res_data["cameras"].append(cam_info)

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

    # =====================================================
    # 5. Update max_people                              ===
    # =====================================================
    requests.get(
        "http://" + instance.inference_module.url + "/update_max_people",
        params={"max_people": instance.max_people},
        timeout=REQUEST_TIMEOUT,
    )

    # =====================================================
    # 6. Update last fps                                ===
    # =====================================================
    # TODO filter PDScenario object, set its fps
    logger.info('Update last fps')
    part_detection_scenario_obj = PDScenario.objects.filter(
        inference_mode=instance.inference_mode).first()
    part_detection_scenario_obj.set_fps(instance.fps)


def if_trained_then_deploy_catcher(part_detection_id):
    """if_trained_then_deploy_catcher.

    Catch every exception when deploy.
    """
    try:
        if_trained_then_deploy_worker(part_detection_id=part_detection_id)
    except Exception:
        upcreate_deploy_status(
            part_detection_id=part_detection_id,
            status="Failed",
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
