from django.test import TestCase
from django.core.exceptions import MultipleObjectsReturned
from cameras.models import Camera
from rest_framework.test import APITransactionTestCase
from .test_special_strings import special_strings
from unittest.mock import patch


class CameraTestCase(APITransactionTestCase):
    def setUp(self):
        with patch('requests.get') as mock_request:
            mock_request.return_value.status_code = 200
            Camera.objects.create(name="Camera1",
                                  rtsp="0",
                                  model_name="model1",
                                  area="0",
                                  is_demo=True)

            Camera.objects.create(name="Camera2",
                                  rtsp="0",
                                  model_name="model2",
                                  area="0",
                                  is_demo=True)

            Camera.objects.create(name="Camera1",
                                  rtsp="0",
                                  model_name="model1",
                                  area="0",
                                  is_demo=False)
            Camera.objects.create(name="Camera2",
                                  rtsp="0",
                                  model_name="model2",
                                  area="0",
                                  is_demo=False)
            for s in special_strings:
                Camera.objects.create(name=s,
                                      rtsp=s,
                                      model_name=s,
                                      area=s,
                                      is_demo=False)
        self.exist_num = 4 + len(special_strings)

    def test_setup_is_valid(self):
        self.assertEqual(Camera.objects.count(), self.exist_num)
        self.assertRaises(MultipleObjectsReturned,
                          Camera.objects.get, name='Camera1')
        camera1 = Camera.objects.filter(name='Camera1').last()
        self.assertFalse(camera1.is_demo)
        camera1 = Camera.objects.filter(name='Camera2').last()
        self.assertFalse(camera1.is_demo)
        camera1 = Camera.objects.filter(name='Camera1').first()
        self.assertTrue(camera1.is_demo)
        camera1 = Camera.objects.filter(name='Camera2').first()
        self.assertTrue(camera1.is_demo)
