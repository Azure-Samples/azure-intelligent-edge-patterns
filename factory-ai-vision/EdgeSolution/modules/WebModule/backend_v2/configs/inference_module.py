"""Inference Module Config
"""

import os

from config import DF_INFERENECE_IS_GPU

DF_INFERENECE_IS_GPU = os.environ.get("DF_INFERENECE_IS_GPU", DF_INFERENECE_IS_GPU)
