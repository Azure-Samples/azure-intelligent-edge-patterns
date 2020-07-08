"""
Azure Custom Vision Settings

Get custom vision related config from
1. Environment variables
2. config.py
"""
import os

from config import ENDPOINT, TRAINING_KEY

if 'TRAINING_KEY' in os.environ:
    TRAINING_KEY = os.environ['TRAINING_KEY']
if 'ENDPOINT' in os.environ:
    ENDPOINT = os.environ['ENDPOINT']
