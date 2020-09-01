# -*- coding: utf-8 -*-
"""Universal utils that does not depends on any model
"""


def normalize_rtsp(rtsp: str) -> str:
    """normalize_rtsp.

    RTSP://xxx => rtsp://

    Args:
        rtsp (str): rtsp

    Returns:
        str: normalized_rtsp
    """
    normalized_rtsp = rtsp
    if isinstance(rtsp, str) and rtsp.lower().find("rtsp") == 0:
        normalized_rtsp = "rtsp" + rtsp[4:]
    return normalized_rtsp
