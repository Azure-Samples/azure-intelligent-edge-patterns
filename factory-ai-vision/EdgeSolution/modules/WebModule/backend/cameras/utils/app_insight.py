import logging

from configs.app_insight import APP_INSIGHT_ON, APP_INSIGHT_INST_KEY, APP_INSIGHT_CONN_STR
from opencensus.ext.azure.log_exporter import AzureLogHandler


def get_app_insight_logger():
    if APP_INSIGHT_ON:
        app_insight_logger = logging.getLogger(
            "Backend-Training-App-Insight")
        app_insight_logger.addHandler(AzureLogHandler(
            connection_string=APP_INSIGHT_CONN_STR)
        )
        return APP_INSIGHT_ON, app_insight_logger
    else:
        return APP_INSIGHT_ON, None
