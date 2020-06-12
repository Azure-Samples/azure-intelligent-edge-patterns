from django.test import TestCase
from cameras.models import Camera
from unittest.mock import patch


class CameraTestCase(TestCase):
    def setUp(self):
        with patch('requests.get') as mock_request:
            mock_request.return_value.status_code = 200
            Camera.objects.create(name="Camera1",
                                  rtsp="0",
                                  model_name="model1",
                                  area="QQ",
                                  is_demo=False)

            Camera.objects.create(name="Camera2",
                                  rtsp="0",
                                  model_name="model1",
                                  area="55,66",
                                  is_demo=False)
            Camera.objects.create(name="DemoCamera1",
                                  rtsp="0",
                                  model_name="model1",
                                  area="QQ",
                                  is_demo=True)
            Camera.objects.create(name="DemoCamera2",
                                  rtsp="0",
                                  model_name="model3",
                                  area="QQ",
                                  is_demo=True)
        self.exist_num = 4

    def test_setup_is_valid(self):
        self.assertEqual(Camera.objects.count(), self.exist_num)
