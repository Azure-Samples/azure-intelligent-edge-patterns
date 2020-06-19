from rest_framework.test import APITransactionTestCase
from cameras.models import Camera
from unittest.mock import patch
from .test_special_strings import special_strings


class CameraTestCase(APITransactionTestCase):
    def setUp(self):
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
                                  rtsp="12",
                                  area="QQ",
                                  is_demo=True)
            for s in special_strings:
                Camera.objects.create(name=s,
                                      rtsp=s,
                                      area=s,
                                      is_demo=False)
        self.exist_num = 4 + len(special_strings)

    def test_setup_is_valid(self):
        self.assertEqual(Camera.objects.count(), self.exist_num)
