#!/usr/bin/env python

LOGGING_CONFIG_DEV = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "precise"}},
    "formatters": {
        "precise": {
            "format": "%(asctime)s [%(levelname)s]: %(message)s",
            "datefmt": "[%d-%b %H:%M:%S]",
        }
    },
    "root": {"handlers": ["console"], "level": "INFO"},
}
