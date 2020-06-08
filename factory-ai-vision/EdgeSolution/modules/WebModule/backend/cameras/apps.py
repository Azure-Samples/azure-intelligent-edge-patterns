from django.apps import AppConfig
from config import *

import logging
import sys
import threading
import time

from datetime import datetime
from opencensus.ext.azure import metrics_exporter
from opencensus.stats import aggregation as aggregation_module
from opencensus.stats import measure as measure_module
from opencensus.stats import stats as stats_module
from opencensus.stats import view as view_module
from opencensus.tags import tag_map as tag_map_module
from configs.app_insight import APP_INSIGHT_CONN_STR


logger = logging.getLogger(__name__)


class CameraConfig(AppConfig):
    name = 'cameras'

    def ready(self):
        if 'runserver' in sys.argv:
            from cameras.models import Part, Camera, Location, Project, Train, Image, Setting
            logger.info("CameraAppConfig ready while running server")
            DEFAULT_SETTING_NAME = 'DEFAULT_SETTING'

            existing_settings = Setting.objects.filter(
                name=DEFAULT_SETTING_NAME,
                training_key=TRAINING_KEY,
                endpoint=ENDPOINT)
            if len(existing_settings) == 1:
                logger.info(
                    f"Found existing {DEFAULT_SETTING_NAME}. Revalidating in pre_save...")
                setting = existing_settings[0]
                setting.save()

            elif len(Setting.objects.filter(
                    name=DEFAULT_SETTING_NAME)) > 0:
                logger.info(
                    f"Found existing {DEFAULT_SETTING_NAME} with different (Endpoint, key)")
                logger.info(f"User may already changed the key ")
                # settings_with_dup_name.delete()

            elif len(Setting.objects.filter(
                    endpoint=ENDPOINT,
                    training_key=TRAINING_KEY)) > 0:
                logger.info(
                    f"Found existing (Endpoint, key) with different setting name")
                logger.info(f"Pass...")

            else:
                logger.info(f"Creating new {DEFAULT_SETTING_NAME}")
                default_setting, created = Setting.objects.update_or_create(
                    name=DEFAULT_SETTING_NAME,
                    training_key=TRAINING_KEY,
                    endpoint=ENDPOINT,
                    iot_hub_connection_string=IOT_HUB_CONNECTION_STRING,
                    device_id=DEVICE_ID,
                    module_id=MODULE_ID
                )
                if not created:
                    logger.error(
                        f"{DEFAULT_SETTING_NAME} not created. Something went wrong")

            default_setting, created = Setting.objects.update_or_create(
                name=DEFAULT_SETTING_NAME)

            create_demo = True
            if create_demo:

                logger.info("Creating Demo")
                for partname in ['Box', 'Barrel', 'Hammer', 'Screwdriver', 'Bottle', 'Plastic bag']:
                    demo_part, created = Part.objects.update_or_create(
                        name=partname,
                        is_demo=True,
                        defaults={
                            'description': "Demo"
                        }
                    )

                demo_camera, created = Camera.objects.update_or_create(
                    name="Demo Video",
                    is_demo=True,
                    defaults={
                        'model_name': "Demo Model",
                        'rtsp': "sample_video/video.mp4",
                        'area': ""
                    }
                )

                demo_location, created = Location.objects.update_or_create(
                    name="Demo Location",
                    is_demo=True,
                    defaults={
                        'description': "Demo Model",
                        'coordinates': "0,0",
                    }
                )

                default_setting, created = Setting.objects.update_or_create(
                    name=DEFAULT_SETTING_NAME)
                demo_project, created = Project.objects.update_or_create(
                    is_demo=True,
                    defaults={
                        'setting': default_setting,
                        'camera': demo_camera,
                        'location': demo_location,
                        'customvision_project_id': 'Blank',
                        'customvision_project_name': 'Blank',

                    }
                )

                demo_train, created = Train.objects.update_or_create(
                    project=demo_project,
                    defaults={
                        'status': 'demo ok',
                        'log': 'demo log',
                        'performance': 1,
                    }
                )
                logger.info("Creating Demo... End")

            default_project, created = Project.objects.update_or_create(
                is_demo=False,
                camera=demo_camera,
                location=demo_location)

            from configs.app_insight import APP_INSIGHT_ON
            if APP_INSIGHT_ON:
                stats = stats_module.stats
                view_manager = stats.view_manager
                stats_recorder = stats.stats_recorder
                exporter = metrics_exporter.new_metrics_exporter(
                    connection_string=APP_INSIGHT_CONN_STR)
                view_manager.register_exporter(exporter)

                def _part_monitor():
                    PARTS_MEASURE = measure_module.MeasureInt("part",
                                                              "number of parts",
                                                              "parts")
                    PARTS_VIEW = view_module.View("part_view",
                                                  "number of parts",
                                                  [],
                                                  PARTS_MEASURE,
                                                  aggregation_module.LastValueAggregation())
                    view_manager.register_view(PARTS_VIEW)
                    while True:
                        time.sleep(15)
                        mmap_1 = stats_recorder.new_measurement_map()
                        mmap_1.measure_int_put(PARTS_MEASURE, len(
                            Part.objects.filter(is_demo=False)))
                        mmap_1.record()
                        metrics = list(
                            mmap_1.measure_to_view_map.get_metrics(datetime.utcnow()))

                def _img_monitor():
                    IMAGES_MEASURE = measure_module.MeasureInt("images",
                                                               "number of images",
                                                               "images")
                    IMAGES_VIEW = view_module.View("image_view",
                                                   "number of images",
                                                   [],
                                                   IMAGES_MEASURE,
                                                   aggregation_module.LastValueAggregation())
                    view_manager.register_view(IMAGES_VIEW)
                    while True:
                        time.sleep(15)
                        mmap_2 = stats_recorder.new_measurement_map()
                        mmap_2.measure_int_put(IMAGES_MEASURE, len(
                            Image.objects.all()))
                        mmap_2.record()
                        metrics = list(
                            mmap_2.measure_to_view_map.get_metrics(datetime.utcnow()))

                def _training_job_triggered_monitor():
                    TRAINING_JOB_TRIGGERED_MEASURE = measure_module.MeasureInt("training_job_triggered",
                                                                               "number of training job triggered",
                                                                               "training_job_triggered")
                    TRAINING_JOB_TRIGGERED_VIEW = view_module.View("training_job_triggered_view",
                                                                   "number of training job triggered",
                                                                   [],
                                                                   TRAINING_JOB_TRIGGERED_MEASURE,
                                                                   aggregation_module.LastValueAggregation())
                    view_manager.register_view(TRAINING_JOB_TRIGGERED_VIEW)
                    while True:
                        time.sleep(15)
                        mmap_3 = stats_recorder.new_measurement_map()
                        mmap_3.measure_int_put(TRAINING_JOB_TRIGGERED_MEASURE, Project.objects.filter(
                            is_demo=False)[0].train_success_counter)
                        mmap_3.record()
                        metrics = list(
                            mmap_3.measure_to_view_map.get_metrics(datetime.utcnow()))

                def _retraining_jobs_monitor():
                    RETRAINING_JOB_MEASURE = measure_module.MeasureInt("retraining_jobs",
                                                                       "number of retraining jobs",
                                                                       "retraining_jobs")
                    RETRAINING_JOB_VIEW = view_module.View("retraining_job_view",
                                                           "number of retraining jobs",
                                                           [],
                                                           RETRAINING_JOB_MEASURE,
                                                           aggregation_module.LastValueAggregation())
                    view_manager.register_view(RETRAINING_JOB_VIEW)
                    while True:
                        time.sleep(15)
                        mmap_4 = stats_recorder.new_measurement_map()
                        mmap_4.measure_int_put(RETRAINING_JOB_MEASURE, Project.objects.filter(
                            is_demo=False)[0].train_try_counter)
                        mmap_4.record()
                        metrics = list(
                            mmap_4.measure_to_view_map.get_metrics(datetime.utcnow()))
                threading.Thread(target=_part_monitor).start()
                threading.Thread(target=_img_monitor).start()
                threading.Thread(
                    target=_training_job_triggered_monitor).start()
                threading.Thread(target=_retraining_jobs_monitor).start()
