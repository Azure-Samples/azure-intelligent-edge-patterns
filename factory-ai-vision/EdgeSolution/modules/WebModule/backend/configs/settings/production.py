"""Django settings for vision_on_edge project.

Use in production.
"""
# pylint: disable = wildcard-import, unused-wildcard-import

import os

from .base import *  # noqa: F403, F401

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["DBNAME"],
        "HOST": os.environ["DBHOST"],
        "USER": os.environ["DBUSER"],
        "PASSWORD": os.environ["DBPASS"],
        "OPTIONS": {"connect_timeout": 5},
    }
}
