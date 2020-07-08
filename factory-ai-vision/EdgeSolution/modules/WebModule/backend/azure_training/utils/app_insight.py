import logging
from datetime import datetime

from opencensus.ext.azure import metrics_exporter
from opencensus.ext.azure.log_exporter import AzureLogHandler
from opencensus.stats import aggregation as aggregation_module
from opencensus.stats import measure as measure_module
from opencensus.stats import stats as stats_module
from opencensus.stats import view as view_module
from opencensus.tags import tag_map as tag_map_module

from configs.app_insight import (APP_INSIGHT_CONN_STR, APP_INSIGHT_INST_KEY,
                                 APP_INSIGHT_ON)

stats = stats_module.stats
view_manager = stats.view_manager
stats_recorder = stats.stats_recorder
exporter = metrics_exporter.new_metrics_exporter(
    connection_string=APP_INSIGHT_CONN_STR)
view_manager.register_exporter(exporter)

#
# Part
#
PARTS_MEASURE = measure_module.MeasureInt("part", "number of parts", "parts")
PARTS_VIEW = view_module.View("part_view", "number of parts", [],
                              PARTS_MEASURE,
                              aggregation_module.LastValueAggregation())
view_manager.register_view(PARTS_VIEW)

#
# Image
#
IMAGES_MEASURE = measure_module.MeasureInt("images", "number of images",
                                           "images")
IMAGES_VIEW = view_module.View("image_view", "number of images", [],
                               IMAGES_MEASURE,
                               aggregation_module.LastValueAggregation())
view_manager.register_view(IMAGES_VIEW)

#
# TRAINING_JOB
#
TRAINING_JOB_MEASURE = measure_module.MeasureInt("training_jobs",
                                                 "number of training jobs",
                                                 "training_jobs")
TRAINING_JOB_VIEW = view_module.View("training_job_view",
                                     "number of training jobs", [],
                                     TRAINING_JOB_MEASURE,
                                     aggregation_module.LastValueAggregation())
view_manager.register_view(TRAINING_JOB_VIEW)

#
# RETRAINING_JOB
#
RETRAINING_JOB_MEASURE = measure_module.MeasureInt(
    "retraining_jobs", "number of retraining jobs", "retraining_jobs")
RETRAINING_JOB_VIEW = view_module.View(
    "retraining_job_view", "number of retraining jobs", [],
    RETRAINING_JOB_MEASURE, aggregation_module.LastValueAggregation())
view_manager.register_view(RETRAINING_JOB_VIEW)

mmap_1 = stats_recorder.new_measurement_map()
mmap_2 = stats_recorder.new_measurement_map()
mmap_3 = stats_recorder.new_measurement_map()
mmap_4 = stats_recorder.new_measurement_map()


def get_app_insight_logger():
    app_insight_logger = logging.getLogger("Backend-Training-App-Insight")
    app_insight_logger.handlers = []
    app_insight_logger.addHandler(
        AzureLogHandler(connection_string=APP_INSIGHT_CONN_STR))
    return app_insight_logger


def part_monitor(count: int):
    mmap_1.measure_int_put(PARTS_MEASURE, count)
    mmap_1.record()
    metrics = list(mmap_1.measure_to_view_map.get_metrics(datetime.utcnow()))


def img_monitor(count: int):
    mmap_2.measure_int_put(IMAGES_MEASURE, count)
    mmap_2.record()
    metrics = list(mmap_2.measure_to_view_map.get_metrics(datetime.utcnow()))


def training_job_monitor(count: int):
    mmap_3.measure_int_put(TRAINING_JOB_MEASURE, count)
    mmap_3.record()
    metrics = list(mmap_3.measure_to_view_map.get_metrics(datetime.utcnow()))


def retraining_job_monitor(count: int):
    mmap_4.measure_int_put(RETRAINING_JOB_MEASURE, count)
    mmap_4.record()
    metrics = list(mmap_4.measure_to_view_map.get_metrics(datetime.utcnow()))
