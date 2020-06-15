from django.test import TestCase
from cameras.models import Part
from django.core.exceptions import MultipleObjectsReturned
from rest_framework.test import APITransactionTestCase
from .test_special_strings import special_strings


class PartTestCase(APITransactionTestCase):
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
        for s in special_strings:
            Part.objects.create(name=s,
                                description=s,
                                is_demo=False)

        self.exist_num = 4 + len(special_strings)

    def test_setup_is_valid(self):
        self.assertEqual(Part.objects.count(), self.exist_num)
        self.assertRaises(MultipleObjectsReturned,
                          Part.objects.get, name='Part1')

    def test_get(self):
        part1 = Part.objects.filter(name='Part1').last()
        self.assertFalse(part1.is_demo)
        part1 = Part.objects.filter(name='Part2').last()
        self.assertFalse(part1.is_demo)
        part1 = Part.objects.filter(name='Part1').first()
        self.assertTrue(part1.is_demo)
        part1 = Part.objects.filter(name='Part2').first()
        self.assertTrue(part1.is_demo)
