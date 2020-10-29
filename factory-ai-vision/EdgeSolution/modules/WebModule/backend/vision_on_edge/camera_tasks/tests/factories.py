"""App model factories
"""

import factory
from factory import DjangoModelFactory, Faker

from ...azure_projects.tests.factories import ProjectFactory
from ...inference_modules.tests.factories import InferenceModuleFactory
from ..models import CameraTask


class CameraTaskFactory(DjangoModelFactory):
    """CameraTaskFactory."""

    name = Faker("name")
    camera = factory.SubFactory(ProjectFactory)
    inference_module = factory.SubFactory(InferenceModuleFactory)

    class Meta:
        """Meta."""

        model = CameraTask
