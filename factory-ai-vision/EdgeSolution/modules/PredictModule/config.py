# -*- coding: utf-8 -*-
"""Config.
"""
import os

IOTHUB_CONNECTION_STRING = ''
IOTHUB_CONNECTION_STRING = os.environ.get('IOTHUB_CONNECTION_STRING',
                                          IOTHUB_CONNECTION_STRING)

