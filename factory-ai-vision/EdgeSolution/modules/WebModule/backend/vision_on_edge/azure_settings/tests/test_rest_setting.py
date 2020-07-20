"""
Camera REST API Test
"""
import logging

from django.urls import reverse
from rest_framework.test import APITransactionTestCase

#from rest_framework import status

#from rest_framework import status

logger = logging.getLogger(__name__)


class CameraRestTests(APITransactionTestCase):
    """
    Camera REST API Test
    """

    def setUp(self):
        """
        Setup
        """
        url = reverse('setting-list')
        data = {'name': 'Part1', 'description': 'Desb1'}
        self.client.post(url, data, format='json')
        self.exist_num = 1
