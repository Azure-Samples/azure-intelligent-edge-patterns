"""
Camere Model Testcase
"""
from unittest.mock import patch

from rest_framework.test import APITransactionTestCase

from ..models import Camera
from .test_special_strings import special_strings


class CameraTestCase(APITransactionTestCase):
    """
    Camere Model Test Cases
    """

    def setUp(self):
        """
        Setup objects
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

    def test_setup_is_valid(self):
        """
        Make sure setup valid
        """
