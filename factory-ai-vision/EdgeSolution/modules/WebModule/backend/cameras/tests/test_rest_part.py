from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from cameras.models import Part
import logging


class PartTests(APITestCase):
    def test_create_part(self):
        """
        Ensure we can create a new account object.
        """
        url = reverse('part-list')
        data = {'name': 'Box',
                'description': 'Desb1'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Part.objects.count(), 1)
        self.assertEqual(Part.objects.get().name, 'Box')

    def test_create_dup_parts(self):
        """
        Ensure we can create a new account object.
        """
        url = reverse('part-list')
        data = {'name': 'Box',
                'description': 'Desb1'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Part.objects.count(), 1)
        self.assertEqual(Part.objects.get().name, 'Box')

    def test_create_same_lowercase_parts(self):
        """
        Ensure we can create a new account object.
        """
        url = reverse('part-list')
        data = {'name': 'Box',
                'description': 'Desb1'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Part.objects.count(), 1)
        self.assertEqual(Part.objects.get().name, 'Box')

        data = {'name': 'BoX',
                'description': 'Desb1'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Part.objects.count(), 1)
        self.assertEqual(Part.objects.get().name, 'Box')

        data = {'name': 'bOx',
                'description': 'Desb1'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Part.objects.count(), 1)
        self.assertEqual(Part.objects.get().name, 'Box')

    def test_create_no_desb_parts(self):
        """
        Ensure we can create a new account object.
        """
        url = reverse('part-list')
        data = {'name': 'Box'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Part.objects.count(), 0)

        data = {'name': 'BoX'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Part.objects.count(), 0)

        data = {'name': 'bOx'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Part.objects.count(), 0)

    def test_same_name_different_is_demo_parts(self):
        """
        Ensure we can create a new account object.
        """
        url = reverse('part-list')
        data = {'name': 'Box',
                'description': 'Desb1',
                'is_demo': False}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Part.objects.count(), 1)
        self.assertEqual(Part.objects.get().name, 'Box')

        data = {'name': 'Box',
                'description': 'Desb1',
                'is_demo': True}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Part.objects.count(), 2)

        data = {'name': 'bOx',
                'description': 'Desb1',
                'is_demo': False}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        logger = logging.getLogger(__name__)
        logger.error(response.data)
        self.assertEqual(Part.objects.count(), 2)

        data = {'name': 'bOx',
                'description': 'Desb1',
                'is_demo': True}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Part.objects.count(), 2)
