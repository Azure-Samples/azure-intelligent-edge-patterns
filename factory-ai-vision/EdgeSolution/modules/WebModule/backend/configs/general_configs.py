"""Project General Configs
"""
import os
import sys

if "PRINT_THREAD" in os.environ and os.environ.get("PRINT_THREAD") in [
    "True",
    "true",
    "1",
]:
    PRINT_THREAD = True
else:
    PRINT_THREAD = False
