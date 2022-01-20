"""App model factories.
"""

from factory import DjangoModelFactory, Faker

from ..models import InferenceModule


class InferenceModuleFactory(DjangoModelFactory):
    """InferenceModuleFactory."""

    name = Faker("name")
    url = Faker("url")

    class Meta:
        model = InferenceModule
        django_get_or_create = ["url"]
