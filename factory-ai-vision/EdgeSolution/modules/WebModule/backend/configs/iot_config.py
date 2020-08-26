"""Azure IOT Settings

Get custom vision related config from following order
1. Environment variables
2. config.py
"""
import os

from config import DEVICE_ID, IOT_HUB_CONNECTION_STRING, MODULE_ID

if 'IOT_HUB_CONNECTION_STRING' in os.environ:
    IOT_HUB_CONNECTION_STRING = os.getenv('IOT_HUB_CONNECTION_STRING',
                                          IOT_HUB_CONNECTION_STRING)

if 'DEVICE_ID' in os.environ:
    DEVICE_ID = os.getenv('DEVICE_ID', DEVICE_ID)

if 'MODULE_ID' in os.environ:
    MODULE_ID = os.getenv('MODULE_ID', MODULE_ID)
