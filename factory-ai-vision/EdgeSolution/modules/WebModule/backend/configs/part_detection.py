"""Part Detection Config
"""

import os

from config import DF_PD_VIDEO_SOURCE

DF_PD_VIDEO_SOURCE = os.environ.get("DF_PD_VIDEO_SOURCE", DF_PD_VIDEO_SOURCE)

if (
    isinstance(DF_PD_VIDEO_SOURCE, str)
    and DF_PD_VIDEO_SOURCE.lower().find("opencv") >= 0
):
    DF_PD_VIDEO_SOURCE_IS_OPENCV = True
else:
    DF_PD_VIDEO_SOURCE_IS_OPENCV = False
