"""Conftest
"""

from unittest import mock

mock.patch(
    "vision_on_edge.cameras.models.Camera.verify_rtsp",
    mock.MagicMock(return_value=True),
).start()
