"""Inference Module Config
"""

import os

from config import DF_INFERENECE_IS_GPU

DF_INFERENECE_IS_GPU = os.environ.get("DF_INFERENECE_IS_GPU", DF_INFERENECE_IS_GPU)

if DF_INFERENECE_IS_GPU in ["True", "true", "1", 1]:
    DF_INFERENECE_IS_GPU = True
elif DF_INFERENECE_IS_GPU in ["False", "false", "0", 0]:
    DF_INFERENECE_IS_GPU = False
