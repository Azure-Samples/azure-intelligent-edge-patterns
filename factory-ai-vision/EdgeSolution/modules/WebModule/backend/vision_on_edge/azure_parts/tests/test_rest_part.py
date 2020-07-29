# -*- coding: utf-8 -*-
"""Azure Part REST API testcases.
"""

import json
import logging

from django.urls import reverse
from rest_framework import status

from vision_on_edge.general.tests.test_special_strings import special_strings
from vision_on_edge.general.tests.azure_testcase import CustomVisionTestCase

from ..models import Part

logger = logging.getLogger(__name__)


class AzurePartRestTestCases(CustomVisionTestCase):
    """AzurePartRestTestCases.

    Azure Part REST API testcases.
    """

    def setUp(self):
        """setUp.
        """
        url = reverse('part-list')
        data = {'name': 'Part1', 'description': 'Desb1'}
        self.client.post(url, data, format='json')

        data = {'name': 'Part2', 'description': 'Desb2'}
        self.client.post(url, data, format='json')
        data = {'name': 'Part3', 'description': 'Desb3'}
        self.client.post(url, data, format='json')

        data = {'name': 'DemoPart1', 'description': 'Desb1', 'is_demo': True}
        self.client.post(url, data, format='json')

        data = {'name': 'DemoPart2', 'description': 'Desb1', 'is_demo': True}
        self.client.post(url, data, format='json')

        data = {'name': 'DemoPart3', 'description': 'Desb1', 'is_demo': True}
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

        self.exist_num = 6 + 2 * (len(special_strings))

    def test_setup_is_valid(self):
        """test_setup_is_valid.
        """
        url = reverse('part-list')
        response = self.client.get(url, format='json')
        self.assertEqual(len(json.loads(response.content)), self.exist_num)

    def test_create_part(self):
        """test_create_part.

        Type:
            Positive

        Description:
            Ensure we can created a part by rest api.

        Expected Results:
            200 { 'name':'part_name', 'description':'part_description' }
        """
        url = reverse('part-list')
        part_name = 'Unittest Box'
        part_desb = 'Unittest Box Description'

        data = {'name': part_name, 'description': part_desb}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(json.loads(response.content)['name'], part_name)
        self.assertEqual(
            json.loads(response.content)['description'], part_desb)
        self.assertEqual(Part.objects.count(), self.exist_num + 1)
        self.assertEqual(Part.objects.get(name=part_name).name, part_name)

    def test_create_dup_parts(self):
        """
        Type:
            Negative

        Description:
            Ensure create duplicate Part objects will failed.

        Expected Results:
            400 { 'status': 'failed', 'log': 'xxx'}
        """
        # Var
        url = reverse('part-list')
        part_name = 'Part1'
        part_desb = 'Unittest Part1 Description'

        # Request
        data = {'name': part_name, 'description': part_desb}
        response = self.client.post(url, data, format='json')

        # Check
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content)['status'], 'failed')
        self.assertNotEqual(json.loads(response.content)['log'], '')
        self.assertEqual(Part.objects.count(), self.exist_num)

    def test_create_same_lowercase_parts(self):
        """test_create_same_lowercase_parts.

        Type:
            Negative

        Description:
            Ensure Part (name, is_demo) is unique together.

        Expected Results
            400 { 'status': 'failed', 'log': 'xxx' }
        """
        # Random Case
        url = reverse('part-list')

        # Request
        data = {'name': 'pArT1', 'description': 'New Description'}
        response = self.client.post(url, data, format='json')

        # Check
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content)['status'], 'failed')
        self.assertNotEqual(json.loads(response.content)['log'], '')
        self.assertEqual(Part.objects.count(), self.exist_num)

        # All upper case
        # Request
        data = {'name': 'PART2', 'description': 'New Description'}
        response = self.client.post(url, data, format='json')

        # Check
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content)['status'], 'failed')
        self.assertNotEqual(json.loads(response.content)['log'], '')
        self.assertEqual(Part.objects.count(), self.exist_num)

        # All lowercase
        # Request
        data = {'name': 'part3', 'description': 'New Description'}
        response = self.client.post(url, data, format='json')

        # Check
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content)['status'], 'failed')
        self.assertNotEqual(json.loads(response.content)['log'], '')
        self.assertEqual(Part.objects.count(), self.exist_num)

    def test_create_no_desb_parts(self):
        """test_create_no_desb_parts.

        Type:
            Positive

        Description:
            Create a part without description assigned.
            Description column is not mandatory.

        Expected Results:
            201 { 'name': 'part_name', 'description': 'xxx' }
        """
        # Var
        url = reverse('part-list')
        default_desb = ''

        # Request
        part_name = 'nEw_pArT1'
        data = {'name': part_name}
        response = self.client.post(url, data, format='json')

        # Check
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(json.loads(response.content)['name'], part_name)
        self.assertEqual(
            json.loads(response.content)['description'], default_desb)
        self.assertEqual(Part.objects.count(), self.exist_num + 1)

        # Request
        part_name = 'NEW_PART2'
        data = {'name': part_name}
        response = self.client.post(url, data, format='json')

        # Check
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(json.loads(response.content)['name'], part_name)
        self.assertEqual(
            json.loads(response.content)['description'], default_desb)
        self.assertEqual(Part.objects.count(), self.exist_num + 2)

    def test_create_demo_parts_with_same_name(self):
        """test_create_demo_parts_with_same_name.

        Type:
            Negative

        Description:
            Create demo part and none-demo part with same name.
            Should pass.

        Expected Results:
            pass
        """
        url = reverse('part-list')
        data = {'name': 'Part1', 'description': 'Desb1', 'is_demo': True}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Part.objects.count(), self.exist_num + 1)

        data = {'name': 'Part2', 'description': 'Desb1', 'is_demo': True}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Part.objects.count(), self.exist_num + 2)

        data = {'name': 'DemoPart1', 'description': 'Desb1'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Part.objects.count(), self.exist_num + 3)

        data = {'name': 'DemoPart2', 'description': 'Desb1'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Part.objects.count(), self.exist_num + 4)

    def test_create_demo_parts_with_same_name_2(self):
        """test_create_demo_parts_with_same_name_2.

        Type:
            Positive

        Description:
            Create parts with same name.

        Expected Results:
            Failed.
        """
        url = reverse('part-list')
        data = {'name': 'Part1', 'description': 'Desb1', 'is_demo': False}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Part.objects.count(), self.exist_num)

        data = {'name': 'Part2', 'description': 'Desb1'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Part.objects.count(), self.exist_num)

        data = {'name': 'DemoPart1', 'description': 'Desb1', 'is_demo': True}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Part.objects.count(), self.exist_num)

        data = {'name': 'DemoPart2', 'description': 'Desb1', 'is_demo': True}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Part.objects.count(), self.exist_num)

    def test_put(self):
        """test_put.

        Type:
            Positive

        Description:
            Test update is ok.

        Expected Results:
            200 OK
        """
        # New description
        url = reverse('part-list')
        response = self.client.get(url)
        for part in response.data:
            if part['name'] == 'Part2':
                part2_id = part['id']
            if part['name'] == 'Part1':
                part1_id = part['id']
        data = {'name': 'New Part Name', 'description': 'New Description'}
        response = self.client.put(f'{url}/{part1_id}', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Part.objects.count(), self.exist_num)
        data = {'name': 'DemoPart1', 'description': 'New Description'}
        response = self.client.put(f'{url}/{part2_id}', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Part.objects.count(), self.exist_num)
