"""App model factories.
"""


from factory import DjangoModelFactory, Faker, SubFactory

from ...azure_projects.tests.factories import ProjectFactory
from ..models import Part


class PartFactory(DjangoModelFactory):
    """PartFactory."""

    project = SubFactory(ProjectFactory)
    name = Faker("name")
    description = Faker("sentence")

    class Meta:
        model = Part
        django_get_or_create = ["name"]
