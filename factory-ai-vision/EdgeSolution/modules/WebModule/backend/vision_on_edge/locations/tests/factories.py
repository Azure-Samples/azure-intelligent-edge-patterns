"""Location Factories
"""

from factory import DjangoModelFactory, Faker

from ...locations.models import Location


class LocationFactory(DjangoModelFactory):
    """LocationFactory."""

    name = Faker("city")
    description = Faker("sentence")

    class Meta:
        model = Location
        django_get_or_create = ["name"]
