# -*- coding: utf-8 -*-
"""App Model Factories
"""

import factory
from factory import DjangoModelFactory, Faker

from vision_on_edge.azure_projects.models import Project
from vision_on_edge.azure_settings.tests.factories import SettingFactory


class ProjectFactory(DjangoModelFactory):
    """ProjectFactory.
    """

    setting = factory.SubFactory(SettingFactory)
    customvision_project_name = Faker("sentence")

    class Meta:
        model = Project
        django_get_or_create = ["customvision_project_name"]
