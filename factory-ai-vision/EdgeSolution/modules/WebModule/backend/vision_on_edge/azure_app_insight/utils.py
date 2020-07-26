"""Utilities

App Insight Utilities.
"""

import logging

from opencensus.ext.azure.log_exporter import AzureLogHandler

from configs.app_insight import APP_INSIGHT_CONN_STR


def get_app_insight_logger() -> logging.Logger:
    """get_app_insight_logger.

    Return a logger with AzureLogHandler added.

    Args:

    Returns:
        logging.Logger:
    """

    app_insight_logger = logging.getLogger("Backend-Training-App-Insight")
    app_insight_logger.handlers = []
    app_insight_logger.addHandler(
        AzureLogHandler(connection_string=APP_INSIGHT_CONN_STR))
    return app_insight_logger
