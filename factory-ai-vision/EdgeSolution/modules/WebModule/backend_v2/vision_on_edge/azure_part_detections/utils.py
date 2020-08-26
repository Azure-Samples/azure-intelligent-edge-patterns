# -*- coding: utf-8 -*-
"""App Utilities
"""

import logging

from vision_on_edge.azure_parts.models import Part


logger = logging.getLogger(__name__)

def if_trained_then_deploy_helper(part_detection_id):
    """update_train_status.

    Open a thread to update the training status object.

    Args:
        project_id:
    """
    # parts = [p.name for p in Part.objects.filter(project=project_obj)]
    # logger.info("Preparing to deploy to inference")
    # logger.info("Project is deployed before: %s", project_obj.deployed)
    # if not project_obj.deployed:
        # if exports[0].download_uri:

            # def _send(download_uri, rtsp, parts):
                # requests.get(
                    # "http://" + inference_module_url() + "/update_cam",
                    # params={
                        # "cam_type": "rtsp",
                        # "cam_source": normalize_rtsp(rtsp)
                    # },
                # )
                # requests.get(
                    # "http://" + inference_module_url() + "/update_model",
                    # params={"model_uri": download_uri},
                # )
                # requests.get(
                    # "http://" + inference_module_url() + "/update_parts",
                    # params={"parts": parts},
                # )

            # threading.Thread(target=_send,
                             # args=(exports[0].download_uri, camera.rtsp,
                                   # parts)).start()

    # project_obj.deployed = True
    # project_obj.save(update_fields=["download_uri", "deployed"])

    # upcreate_training_status(project_id=project_obj.id,
                             # need_to_send_notification=(not deploy_init),
                             # **progress_constants.PROGRESS_9_DEPLOYING)
    # deploy_init = True
    # continue
