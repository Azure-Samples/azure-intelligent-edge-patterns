# -*- coding: utf-8 -*-
"""Camere Model Testcase
"""

from unittest.mock import patch

from rest_framework.test import APITransactionTestCase

from vision_on_edge.general.tests.test_special_strings import special_strings

from ..models import Camera


class CameraTestCase(APITransactionTestCase):
    """CameraTestCase.

    Camere Model testcases.
    """

    def setUp(self):
        """setUp.
        """
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
            for special_string in special_strings:
                Camera.objects.create(name=special_string,
                                      rtsp=0,
                                      area=special_string,
                                      is_demo=False)
        self.exist_num = 4 + len(special_strings)
