"""
Camera REST API Test
"""
from unittest.mock import patch

from django.core.exceptions import MultipleObjectsReturned
from rest_framework.test import APITransactionTestCase

from ..models import Camera
from .test_special_strings import special_strings


class CameraTestCases(APITransactionTestCase):
    """
    Camera REST API TestCases
    """

    def setUp(self):
        with patch('requests.get') as mock_request:
            mock_request.return_value.status_code = 200
            Camera.objects.create(name="Camera1",
                                  rtsp="0",
                                  area="0",
                                  is_demo=True)

            Camera.objects.create(name="Camera2",
                                  rtsp="0",
                                  area="0",
                                  is_demo=True)

            Camera.objects.create(name="Camera1",
                                  rtsp="0",
                                  area="0",
                                  is_demo=False)
            Camera.objects.create(name="Camera2",
                                  rtsp="0",
                                  area="0",
                                  is_demo=False)
            for special_string in special_strings:
                Camera.objects.create(name=special_string,
                                      rtsp=0,
                                      area=special_string,
                                      is_demo=False)
        self.exist_num = 4 + len(special_strings)

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """
        self.assertEqual(Camera.objects.count(), self.exist_num)
        self.assertRaises(MultipleObjectsReturned,
                          Camera.objects.get,
                          name='Camera1')
        camera1 = Camera.objects.filter(name='Camera1').last()
        self.assertFalse(camera1.is_demo)
        camera1 = Camera.objects.filter(name='Camera2').last()
        self.assertFalse(camera1.is_demo)
        camera1 = Camera.objects.filter(name='Camera1').first()
        self.assertTrue(camera1.is_demo)
        camera1 = Camera.objects.filter(name='Camera2').first()
        self.assertTrue(camera1.is_demo)
