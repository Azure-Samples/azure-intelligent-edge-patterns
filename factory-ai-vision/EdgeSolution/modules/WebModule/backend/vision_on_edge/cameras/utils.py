"""App utilities.

Does not depends on app/models.
"""

import logging

import cv2

logger = logging.getLogger(__name__)


def is_valid_rtsp(rtsp):
    """is_valid_rtsp.

    Args:
        rtsp: int 0 or str (rtsp://)
    """
    if str(rtsp) == "0":
        return True
    if isinstance(rtsp, str) and rtsp.lower().find("rtsp") == 0:
        return True
    return False


def normalize_rtsp(rtsp: str) -> str:
    """normalize_rtsp.

    Return cv2 capturable str/integer
    RTSP://xxx => rtsp://

    Args:
        rtsp: rtsp

    Returns:
        str: normalized_rtsp
    """
    if rtsp in [0, "0"]:
        return 0
    if rtsp in [1, "1"]:
        return 1
    result = rtsp
    if isinstance(rtsp, str) and rtsp.lower().find("rtsp") == 0:
        result = "rtsp" + rtsp[4:]
    return result


def verify_rtsp(rtsp):
    """Validate a rtsp.
    Args:
        rtsp (str)

    Returns:
        is_rtsp_valid (bool)
    """

    logger.info("verify_rtsp %s", rtsp)
    rtsp = normalize_rtsp(rtsp=rtsp)
    if not isinstance(rtsp, int) and not isinstance(rtsp, str):
        return False
    if rtsp == "":
        return False
    cap = cv2.VideoCapture(rtsp)
    if not cap.isOpened():
        cap.release()
        return False
    is_ok, _ = cap.read()
    if not is_ok:
        cap.release()
        return False
    cap.release()
    return True
