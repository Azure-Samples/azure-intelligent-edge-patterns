from django.apps import AppConfig
from config import *

import logging
import sys
import threading
import time

logger = logging.getLogger(__name__)


class CameraConfig(AppConfig):
    name = 'cameras'

    def ready(self):
        if 'runserver' in sys.argv:
            logger.info("CameraAppConfig ready while running server")
            DEFAULT_SETTING_NAME = 'DEFAULT_SETTING'

            from cameras.models import Setting

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

            create_demo = True
            if create_demo:
                from cameras.models import Part, Camera, Location, Project, Train
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

#         def _part_monitor():
#             from opencensus.ext.azure import metrics_exporter
#             from opencensus.stats import aggregation as aggregation_module
#             from opencensus.stats import measure as measure_module
#             from opencensus.stats import stats as stats_module
#             from opencensus.stats import view as view_module
#             from opencensus.tags import tag_map as tag_map_module
#             from configs.app_insight import APP_INSIGHT_CONN_STR
#             stats = stats_module.stats
#             view_manager = stats.view_manager
#             stats_recorder = stats.stats_recorder
#
#             PARTS_MEASURE = measure_module.MeasureInt("part",
#                                                       "number of parts",
#                                                       "parts")
#             PARTS_VIEW = view_module.View("part_view",
#                                           "number of parts",
#                                           [],
#                                           PARTS_MEASURE,
#                                           aggregation_module.CountAggregation())
#             # time.sleep(15)
#
#             exporter = metrics_exporter.new_metrics_exporter(
#                 connection_string=APP_INSIGHT_CONN_STR)
#             view_manager.register_exporter(exporter)
#
#             view_manager.register_view(PARTS_VIEW)
#             mmap = stats_recorder.new_measurement_map()
#             tmap = tag_map_module.TagMap()
#
#             mmap.measure_int_put(PARTS_MEASURE, len(
#                 Part.objects.filter(is_demo=False)))
#             mmap.record(tmap)
#             logger.info(len(Part.objects.filter(is_demo=False)))
#
#         threading.Thread(target=_part_monitor).start()
