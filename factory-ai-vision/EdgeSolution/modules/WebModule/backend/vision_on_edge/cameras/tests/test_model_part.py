"""
Part Model and method unittest
"""
from django.core.exceptions import MultipleObjectsReturned
from rest_framework.test import APITransactionTestCase

from ..models import Part
from .test_special_strings import special_strings


class PartTestCase(APITransactionTestCase):
    """
    Part Model and method unittest
    """

    def setUp(self):
        Part.objects.create(name="Part1",
                            description="Description1",
                            is_demo=True)

        Part.objects.create(name="Part2",
                            description="Description2",
                            is_demo=True)

        Part.objects.create(name="Part1",
                            description="SELECT * FROM 'LOCATION'",
                            is_demo=False)

        Part.objects.create(name="Part2",
                            description="python apps.py",
                            is_demo=False)
        for special_string in special_strings:
            Part.objects.create(name=special_string,
                                description=special_string,
                                is_demo=False)
        self.exist_num = 4 + len(special_strings)

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """
        self.assertEqual(Part.objects.count(), self.exist_num)
        self.assertRaises(MultipleObjectsReturned,
                          Part.objects.get,
                          name='Part1')
        part_1 = Part.objects.filter(name='Part1').last()
        self.assertFalse(part_1.is_demo)
        part_2 = Part.objects.filter(name='Part2').last()
        self.assertFalse(part_2.is_demo)
        demo_part_1 = Part.objects.filter(name='Part1').first()
        self.assertTrue(demo_part_1.is_demo)
        demo_part_2 = Part.objects.filter(name='Part2').first()
        self.assertTrue(demo_part_2.is_demo)

    def test_create_without_description(self):
        """
        @Type
        Positive

        @Description
        Create parts without description assigned
        Description column is now not mandatory

        @Expected Results
        Object created. Description is ''
        """
        part_name = "Part without Desb"
        Part.objects.create(name=part_name, is_demo=False)
        part_obj = Part.objects.get(name=part_name)
        self.assertEqual(part_obj.description, '')
