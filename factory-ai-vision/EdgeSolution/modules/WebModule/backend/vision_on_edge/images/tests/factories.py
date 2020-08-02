"""Location Factories
"""

from typing import Any, Sequence

from factory import DjangoModelFactory, Faker, post_generation

from vision_on_edge.locations.models import Location


class LocationFactory(DjangoModelFactory):

    name = Faker("city")
    description = Faker("sentence")

    class Meta:
        model = Location
        django_get_or_create = ["name"]
