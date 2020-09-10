# -*- coding: utf-8 -*-
"""Django settings for vision_on_edge project.

Use in production.
"""
# pylint: disable = wildcard-import, unused-wildcard-import

import os

from .base import *

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ['DBNAME'],
        'HOST': os.environ['DBHOST'],
        'USER': os.environ['DBUSER'],
        'PASSWORD': os.environ['DBPASS'],
        'OPTIONS': {
            'connect_timeout': 5,
        }
    },
}
# pylint: enable = wildcard-import, unused-wildcard-import
