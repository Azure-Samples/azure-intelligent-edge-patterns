# -*- coding: utf-8 -*-
"""Django settings for vision_on_edge project.

Use in development.
"""

# pylint: disable = wildcard-import, unused-wildcard-import
from configs import logging_config
from .base import *

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

LOGGING = logging_config.LOGGING_CONFIG_DEV

# pylint: enable = wildcard-import, unused-wildcard-import
