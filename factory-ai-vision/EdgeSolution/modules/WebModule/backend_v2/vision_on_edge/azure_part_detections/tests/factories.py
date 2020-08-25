"""Azure Project Factories
"""

from typing import Any, Sequence

import factory
from factory import DjangoModelFactory, Faker, post_generation

from vision_on_edge.azure_settings.tests.factories import SettingFactory
from vision_on_edge.azure_projects.models import Project


class ProjectFactory(DjangoModelFactory):
    """ProjectFactory.
    """

    setting = factory.SubFactory(SettingFactory)
    customvision_project_name = Faker("sentence")

    class Meta:
        """Meta.
        """

        model = Project
        django_get_or_create = ["customvision_project_name"]
