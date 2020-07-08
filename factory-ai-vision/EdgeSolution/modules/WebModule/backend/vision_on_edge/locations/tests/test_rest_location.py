"""
Location REST API Test
"""
import json
import logging

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITransactionTestCase

from ..models import Location
from .test_special_strings import special_strings

logger = logging.getLogger(__name__)


class LocationRestTestCases(APITransactionTestCase):
    """
    Test Cases for Location REST API
    """

    def setUp(self):
        url = reverse('location-list')
        data = {'name': 'Location1', 'description': 'Desb1'}
        self.client.post(url, data, format='json')

        data = {'name': 'Location2', 'description': 'Desb2'}
        self.client.post(url, data, format='json')
        data = {'name': 'Location3', 'description': 'Desb3'}
        self.client.post(url, data, format='json')

        data = {
            'name': 'DemoLocation1',
            'description': 'Desb1',
            'is_demo': True
        }
        self.client.post(url, data, format='json')

        data = {
            'name': 'DemoLocation2',
            'description': 'Desb1',
            'is_demo': True
        }
        self.client.post(url, data, format='json')

        data = {
            'name': 'DemoLocation3',
            'description': 'Desb1',
            'is_demo': True
        }
        self.client.post(url, data, format='json')

        for special_string in special_strings:
            data = {
                'name': special_string,
                'description': special_string,
                'is_demo': True
            }
            self.client.post(url, data, format='json')
            data = {
                'name': special_string,
                'description': special_string,
                'is_demo': False
            }
            self.client.post(url, data, format='json')

        self.exist_num = 6 + ((len(special_strings)) * 2)

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """
        url = reverse('location-list')
        response = self.client.get(url, format='json')
        self.assertEqual(len(json.loads(response.content)), self.exist_num)

    def test_create_location_1(self):
        """
        @Type
        Positive

        @Description
        Ensure we can created a location by rest api.

        @Expected Results
        200 {'name': 'location_name',
             'description': 'location_description'}
        """
        url = reverse('location-list')
        location_name = 'Unittest Location'
        location_desb = 'Unittest Location Description'

        data = {'name': location_name, 'description': location_desb}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(json.loads(response.content)['name'], location_name)
        self.assertEqual(
            json.loads(response.content)['description'], location_desb)
        # Get location list
        response = self.client.get(url, format='json')
        self.assertEqual(len(json.loads(response.content)), self.exist_num + 1)
        # Check using db
        self.assertEqual(Location.objects.count(), self.exist_num + 1)
        self.assertEqual(
            Location.objects.get(name=location_name).name, location_name)
