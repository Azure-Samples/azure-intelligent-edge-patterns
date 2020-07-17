"""
Azure App Insight
"""
import logging

from opencensus.ext.azure.log_exporter import AzureLogHandler

from configs.app_insight import APP_INSIGHT_CONN_STR


def get_app_insight_logger():
    app_insight_logger = logging.getLogger("Backend-Training-App-Insight")
    app_insight_logger.handlers = []
    app_insight_logger.addHandler(
        AzureLogHandler(connection_string=APP_INSIGHT_CONN_STR))
    return app_insight_logger
