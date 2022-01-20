"""Logging configs.
"""

LOGGING_CONFIG_PRODUCTION = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "brief"}},
    "formatters": {
        "brief": {
            "format": "[%(asctime)s] [%(levelname)s] %(name)-20s : %(message)s",
            "datefmt": "%d-%b-%Y %H:%M:%S",
        }
    },
    "root": {"handlers": ["console"], "level": "WARNING"},
}

LOGGING_CONFIG_DEV = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "precise"}},
    "formatters": {
        "precise": {
            "format": "[%(asctime)s] [%(levelname)s] %(name)-20s : %(message)s",
            "datefmt": "%d-%b-%Y %H:%M:%S",
        }
    },
    "root": {"handlers": ["console"], "level": "INFO"},
}
