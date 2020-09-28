# -*- coding: utf-8 -*-
"""App model factories.
"""

import factory
from factory import DjangoModelFactory, Faker
from vision_on_edge.azure_parts.models import Part

from ...azure_projects.tests.factories import ProjectFactory


class PartFactory(DjangoModelFactory):
    """PartFactory.
    """

    project = factory.SubFactory(ProjectFactory)
    name = Faker("name")
    description = Faker("sentence")

    class Meta:
        model = Part
        django_get_or_create = ["name"]
