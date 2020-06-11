from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITransactionTestCase
from cameras.models import Part
from config import ENDPOINT, TRAINING_KEY
import logging

logger = logging.getLogger(__name__)


class PartTests(APITransactionTestCase):
    def setUp(self):
        url = reverse('setting-list')
        data = {'name': 'Part1',
                'description': 'Desb1'}
        self.client.post(url, data, format='json')
        self.exist_num = 1
