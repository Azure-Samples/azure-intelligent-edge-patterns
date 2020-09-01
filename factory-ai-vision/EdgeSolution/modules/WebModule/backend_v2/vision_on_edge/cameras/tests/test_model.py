# -*- coding: utf-8 -*-
"""App Model Testcase
"""

from unittest.mock import patch

import pytest
from rest_framework.test import APITransactionTestCase

from ..models import Camera

pytestmark = pytest.mark.django_db


def test_create_camera():
    with patch('requests.get') as mock_request:
        mock_request.return_value.status_code = 200
        Camera.objects.create(name="Camera1",
                              rtsp="0",
                              area="QQ",
                              is_demo=False)

        Camera.objects.create(name="Camera2",
                              rtsp="0",
                              area="55,66",
                              is_demo=False)
        Camera.objects.create(name="Camera1",
                              rtsp="0",
                              area="QQ",
                              is_demo=True)
        Camera.objects.create(name="Camera2",
                              rtsp="0",
                              area="QQ",
                              is_demo=True)
    assert Camera.objects.count() == 4
