from django.test import TestCase
from cameras.models import Part


class PartTestCase(TestCase):
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
        self.exist_num = 4

    def test_setup_is_valid(self):
        self.assertEqual(Part.objects.count(), self.exist_num)
