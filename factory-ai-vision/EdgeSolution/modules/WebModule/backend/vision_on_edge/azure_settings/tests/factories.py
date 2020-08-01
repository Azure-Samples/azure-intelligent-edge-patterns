"""Azure Setting Factories
"""

from typing import Any, Sequence
from factory import DjangoModelFactory, Faker, post_generation

from vision_on_edge.azure_settings.models import Setting

class LocationFactory(DjangoModelFactory):

    name = Faker("city")
    class Meta:
        model = Setting
        django_get_or_create = ["name"]
