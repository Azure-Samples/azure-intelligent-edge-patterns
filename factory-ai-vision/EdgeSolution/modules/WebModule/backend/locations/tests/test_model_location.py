"""
Location ModelViewSet test
"""

from rest_framework.test import APITransactionTestCase

from ..models import Location
from .test_special_strings import special_strings


class LocationTestCase(APITransactionTestCase):
    """
    Location ModelViewSet test cases
    """

    def setUp(self):
        """
        Setup, create objects.
        """
        Location.objects.create(name="Location1",
                                description="description1",
                                is_demo=False)

        Location.objects.create(name="Location2",
                                description="description2",
                                is_demo=False)

        Location.objects.create(name="DemoLocation1",
                                description="SELECT * FROM 'LOCATION'",
                                is_demo=True)

        Location.objects.create(name="DemoLocation2",
                                description="python apps.py",
                                is_demo=True)
        for special_string in special_strings:
            Location.objects.create(name=special_string,
                                    description=special_string,
                                    is_demo=False)
        self.exist_num = 4 + len(special_strings)

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """
        self.assertEqual(Location.objects.count(), self.exist_num)

        location_1 = Location.objects.filter(name='Location1').last()
        self.assertFalse(location_1.is_demo)
        location_2 = Location.objects.filter(name='Location2').last()
        self.assertFalse(location_2.is_demo)
        demo_location_1 = Location.objects.filter(name='DemoLocation1').first()
        self.assertTrue(demo_location_1.is_demo)
        demo_location_2 = Location.objects.filter(name='DemoLocation2').first()
        self.assertTrue(demo_location_2.is_demo)

    def test_create_without_description(self):
        """
        @Type
        Positive

        @Description
        Create locations without description assigned
        Description column is now not mandatory

        @Expected Results
        Object created. Description is ''
        """
        location_name = "Location without Desb"
        Location.objects.create(name=location_name, is_demo=False)
        location_obj = Location.objects.get(name=location_name)
        self.assertEqual(location_obj.description, '')
