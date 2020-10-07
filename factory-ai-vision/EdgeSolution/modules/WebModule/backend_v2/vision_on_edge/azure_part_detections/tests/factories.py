"""App model factories
"""

import factory
from factory import DjangoModelFactory, Faker

from ...azure_projects.tests.factories import ProjectFactory

# from ...cameras.tests.factories import CameraFactory
# from ...parts.tests.factories import PartFactory
from ...inference_modules.tests.factories import InferenceModuleFactory
from ..models import PartDetection


class PartDetectionFactory(DjangoModelFactory):
    """PartDetectionFactory."""

    name = Faker("name")
    project = factory.SubFactory(ProjectFactory)
    inference_module = factory.SubFactory(InferenceModuleFactory)

    class Meta:
        """Meta."""

        model = PartDetection
