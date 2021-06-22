"""
Azure IOT Settings

Get custom vision related config from
1. Environment variables
2. config.py
"""
import os

from config import DEVICE_ID, IOT_HUB_CONNECTION_STRING, MODULE_ID

if 'IOT_HUB_CONNECTION_STRING' in os.environ:
    IOT_HUB_CONNECTION_STRING = os.environ['IOT_HUB_CONNECTION_STRING']
if 'DEVICE_ID' in os.environ:
    DEVICE_ID = os.environ['DEVICE_ID']

if 'MODULE_ID' in os.environ:
    MODULE_ID = os.environ['MODULE_ID']
