from rest_framework.test import APITransactionTestCase
from cameras.models import Location
from .test_special_strings import special_strings


class LocationTestCase(APITransactionTestCase):
    def setUp(self):
        Location.objects.create(name="Location1",
                                description="description1",
                                is_demo=True)

        Location.objects.create(name="Location2",
                                description="description2",
                                is_demo=True)

        Location.objects.create(name="DemoLocation1",
                                description="SELECT * FROM 'LOCATION'",
                                is_demo=False)

        Location.objects.create(name="DemoLocation2",
                                description="python apps.py",
                                is_demo=False)
        for s in special_strings:
            Location.objects.create(name=s,
                                    description=s,
                                    is_demo=False)
        self.exist_num = 4 + len(special_strings)

    def test_setup_is_valid(self):
        self.assertEqual(Location.objects.count(), self.exist_num)
