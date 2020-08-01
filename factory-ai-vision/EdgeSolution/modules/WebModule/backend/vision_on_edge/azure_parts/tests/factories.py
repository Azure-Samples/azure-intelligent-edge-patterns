"""Azure Part Factories
"""

from typing import Any, Sequence
from factory import DjangoModelFactory, Faker, post_generation

from vision_on_edge.azure_parts.models import Part

class PartFactory(DjangoModelFactory):
    """PartFactory.
    """


    name = Faker("name")
    description = Faker("sentence")

    class Meta:
        """Meta.
        """

        model = Part
        django_get_or_create = ["name"]
