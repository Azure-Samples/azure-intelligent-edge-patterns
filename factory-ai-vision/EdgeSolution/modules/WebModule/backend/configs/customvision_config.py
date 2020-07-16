"""
Azure Custom Vision Settings

Get Custom Vision related configs order by:
1. Environment variables
2. config.py
"""
import os

from config import ENDPOINT, TRAINING_KEY

TRAINING_KEY = os.environ.get('TRAINING_KEY', TRAINING_KEY)
ENDPOINT = os.environ.get('ENDPOINT', ENDPOINT)
