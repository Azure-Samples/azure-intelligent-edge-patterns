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
    pass
    # def _train_status_worker(project_id):
        # """_train_status_worker.

        # Args:
            # project_id:
        # """
        # project_obj = Project.objects.get(pk=project_id)
        # trainer = project_obj.setting.revalidate_and_get_trainer_obj()
        # customvision_project_id = project_obj.customvision_project_id
        # wait_prepare = 0
        # # If exceed, this project probably not going to be trained
        # max_wait_prepare = 60

        # # Send notification only when init
        # training_init = False
        # export_init = False

        # while True:
            # time.sleep(1)

            # iterations = trainer.get_iterations(customvision_project_id)
            # if len(iterations) == 0:
                # upcreate_training_status(
                    # project_id=project_obj.id,
                    # **
                    # progress_constants.PROGRESS_6_PREPARING_CUSTOM_VISION_ENV)
                # wait_prepare += 1
                # if wait_prepare > max_wait_prepare:
                    # upcreate_training_status(
                        # project_id=project_obj.id,
                        # status="failed",
                        # log="Get iteration from Custom Vision occurs error.",
                        # need_to_send_notification=True,
                    # )
                    # break
                # continue

            # iteration = iterations[0]
            # if not iteration.exportable or iteration.status != "Completed":
                # upcreate_training_status(
                    # project_id=project_obj.id,
                    # need_to_send_notification=(not training_init),
                    # **progress_constants.PROGRESS_7_TRAINING)
                # training_init = True
                # continue

            # exports = trainer.get_exports(customvision_project_id,
                                          # iteration.id)
            # if len(exports) == 0 or not exports[0].download_uri:
                # upcreate_training_status(
                    # project_id=project_obj.id,
                    # need_to_send_notification=(not export_init),
                    # **progress_constants.PROGRESS_8_EXPORTING)
                # export_init = True
                # res = project_obj.export_iterationv3_2(iteration.id)
                # logger.info(res.json())
                # continue

            # project_obj.download_uri = exports[0].download_uri
            # project_obj.save(update_fields=["download_uri"])
            # parts = [p.name for p in Part.objects.filter(project=project_obj)]

            # logger.info("Successfulling export model: %s",
                        # project_obj.download_uri)
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
                            # "http://" + inference_module_url() +
                            # "/update_model",
                            # params={"model_uri": download_uri},
                        # )
                        # requests.get(
                            # "http://" + inference_module_url() +
                            # "/update_parts",
                            # params={"parts": parts},
                        # )

                    # threading.Thread(target=_send,
                                     # args=(exports[0].download_uri,
                                           # camera.rtsp, parts)).start()

                    # project_obj.deployed = True
                    # project_obj.save(
                        # update_fields=["download_uri", "deployed"])

                # upcreate_training_status(
                    # project_id=project_obj.id,
                    # need_to_send_notification=(not deploy_init),
                    # **progress_constants.PROGRESS_9_DEPLOYING)
                # deploy_init = True
                # continue

            # logger.info("Training Status: Completed")
            # train_performance_list = []
            # for iteration in iterations[:2]:
                # train_performance_list.append(
                    # trainer.get_iteration_performance(customvision_project_id,
                                                      # iteration.id).as_dict())

            # logger.info("Training Performance: %s", train_performance_list)
            # upcreate_training_status(
                # project_id=project_obj.id,
                # performance=json.dumps(train_performance_list),
                # need_to_send_notification=True,
                # **progress_constants.PROGRESS_0_OK)
            # project_obj.has_configured = True
            # project_obj.save()
            # break
    # threading.Thread(target=_train_status_worker, args=(project_id,)).start()
