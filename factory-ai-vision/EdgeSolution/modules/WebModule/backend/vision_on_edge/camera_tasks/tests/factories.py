"""App model factories
"""

from factory import DjangoModelFactory, Faker, SubFactory

from ...cameras.tests.factories import CameraFactory
from ..models import CameraTask


class CameraTaskFactory(DjangoModelFactory):
    """CameraTaskFactory."""

    name = Faker("name")
    camera = SubFactory(CameraFactory)

    class Meta:
        """Meta."""

        model = CameraTask
