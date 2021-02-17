"""App model factories.
"""


from factory import DjangoModelFactory, Faker, SubFactory

from ...azure_projects.models import Project
from ...azure_settings.tests.factories import SettingFactory


class ProjectFactory(DjangoModelFactory):
    """ProjectFactory."""

    setting = SubFactory(SettingFactory)
    name = Faker("sentence")

    class Meta:
        model = Project
        django_get_or_create = ["name"]


class DemoProjectFactory(DjangoModelFactory):
    """DemoProjectFactory."""

    setting = SubFactory(SettingFactory)
    is_demo = True
    name = Faker("sentence")

    class Meta:
        model = Project
        django_get_or_create = ["name"]
