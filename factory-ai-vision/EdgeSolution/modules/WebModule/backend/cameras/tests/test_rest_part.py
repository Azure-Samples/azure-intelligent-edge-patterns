# from django.urls import reverse
# from rest_framework import status
# from rest_framework.test import APITransactionTestCase
# from cameras.models import Part
# import logging
#
# logger = logging.getLogger(__name__)
#
#
# class PartTests(APITransactionTestCase):
#     def setUp(self):
#         url = reverse('part-list')
#         data = {'name': 'Part1',
#                 'description': 'Desb1'}
#         self.client.post(url, data, format='json')
#         data = {'name': 'Part2',
#                 'description': 'Desb2'}
#         response = self.client.post(url, data, format='json')
#         data = {'name': 'Part3',
#                 'description': 'Desb3'}
#         self.client.post(url, data, format='json')
#
#         data = {'name': 'DemoPart1',
#                 'description': 'Desb1',
#                 'is_demo': True}
#         self.client.post(url, data, format='json')
#         data = {'name': 'DemoPart2',
#                 'description': 'Desb1',
#                 'is_demo': True}
#         self.client.post(url, data, format='json')
#         data = {'name': 'DemoPart3',
#                 'description': 'Desb1',
#                 'is_demo': True}
#         self.client.post(url, data, format='json')
#         self.exist_num = 6
#
#     def test_create_part(self):
#         """
#         Ensure we can create a new Part object.
#         """
#         url = reverse('part-list')
#         data = {'name': 'Box',
#                 'description': 'Desb1'}
#         response = self.client.post(url, data, format='json')
#         print(response.data)
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(Part.objects.count(), self.exist_num+1)
#         self.assertEqual(Part.objects.get(name='Box').name, 'Box')
#
#     def test_create_dup_parts(self):
#         """
#         Ensure create duplicate Part objects will failed.
#         """
#         url = reverse('part-list')
#         data = {'name': 'Part1',
#                 'description': 'New Description'}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertEqual(Part.objects.count(), self.exist_num)
#
#     def test_create_same_lowercase_parts(self):
#         """
#         Ensure Part (name, is_demo) is unique together.
#         """
#         url = reverse('part-list')
#         data = {'name': 'pArT1',
#                 'description': 'New Description'}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertEqual(Part.objects.count(), self.exist_num)
#
#         data = {'name': 'PART2',
#                 'description': 'New Description'}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertEqual(Part.objects.count(), self.exist_num)
#
#         data = {'name': 'part3',
#                 'description': 'New Description'}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertEqual(Part.objects.count(), self.exist_num)
#
#     def test_create_no_desb_parts(self):
#         """
#         Ensure no desb will failed.
#         """
#         url = reverse('part-list')
#         data = {'name': 'nEw_pArT1'}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertEqual(Part.objects.count(), self.exist_num)
#
#         data = {'name': 'NEW_PART2'}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertEqual(Part.objects.count(), self.exist_num)
#
#     def test_create_demo_parts_with_same_name(self):
#         """
#         Ensure Create duplicate name (with differenct is_demo) will not conflict
#         """
#         url = reverse('part-list')
#         data = {'name': 'Part1',
#                 'description': 'Desb1',
#                 'is_demo': True}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(Part.objects.count(), self.exist_num+1)
#
#         data = {'name': 'Part2',
#                 'description': 'Desb1',
#                 'is_demo': True}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(Part.objects.count(), self.exist_num+2)
#
#         data = {'name': 'DemoPart1',
#                 'description': 'Desb1'}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(Part.objects.count(), self.exist_num+3)
#
#         data = {'name': 'DemoPart2',
#                 'description': 'Desb1'}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)
#         self.assertEqual(Part.objects.count(), self.exist_num+4)
#
#     def test_create_demo_parts_with_same_name(self):
#         """
#         Ensure Create Parts with Same name will conflict
#         """
#         url = reverse('part-list')
#         data = {'name': 'Part1',
#                 'description': 'Desb1',
#                 'is_demo': False}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertEqual(Part.objects.count(), self.exist_num)
#
#         data = {'name': 'Part2',
#                 'description': 'Desb1'}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertEqual(Part.objects.count(), self.exist_num)
#
#         data = {'name': 'DemoPart1',
#                 'description': 'Desb1',
#                 'is_demo': True}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertEqual(Part.objects.count(), self.exist_num)
#
#         data = {'name': 'DemoPart2',
#                 'description': 'Desb1',
#                 'is_demo': True}
#         response = self.client.post(url, data, format='json')
#         self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
#         self.assertEqual(Part.objects.count(), self.exist_num)
#
#     def test_put(self):
#         """
#         Ensure Update Parts
#         """
#         # New description
#
#         url = reverse('part-list')
#         response = self.client.get(
#             url)
#         for part in response.data:
#             if part['name'] == 'Part2':
#                 part2_id = part['id']
#             if part['name'] == 'Part1':
#                 part1_id = part['id']
#
#         data = {'name': 'New Part Name',
#                 'description': 'New Description'}
#         response = self.client.put(
#             f'{url}/{part1_id}', data, format='json')
#         self.assertEqual(response.status_code,
#                          status.HTTP_200_OK)
#         self.assertEqual(Part.objects.count(), self.exist_num)
#
#         data = {'name': 'DemoPart1',
#                 'description': 'New Description'}
#         response = self.client.put(
#             f'{url}/{part2_id}', data, format='json')
#         self.assertEqual(response.status_code,
#                          status.HTTP_200_OK)
#         self.assertEqual(Part.objects.count(), self.exist_num)
