# -*- coding: utf-8 -*-
"""Azure Project Factories
"""

from typing import Any, Sequence

import factory
from factory import DjangoModelFactory, Faker, post_generation

from ...azure_projects.tests.factories import ProjectFactory
from ...cameras.tests.factories import CameraFactory

class PartDetectionFactory(DjangoModelFactory):
    """PartDetectionFactory.
    """

    setting = factory.SubFactory(SettingFactory)

    customvision_project_name = Faker("sentence")

    class Meta:
        """Meta.
        """

        model = Project
        django_get_or_create = ["customvision_project_name"]
