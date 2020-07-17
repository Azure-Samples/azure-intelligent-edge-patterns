"""Azure Custom Vision Settings

This module finds Custom Vision related configs with following order:
1. System environment variables
2. config.py
"""
import os

from config import ENDPOINT, TRAINING_KEY

TRAINING_KEY = os.environ.get('TRAINING_KEY', TRAINING_KEY)
ENDPOINT = os.environ.get('ENDPOINT', ENDPOINT)
