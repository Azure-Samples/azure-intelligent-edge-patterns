"""App Model Factories
"""


from factory import DjangoModelFactory, Faker, SubFactory

from ...locations.tests.factories import LocationFactory
from ..models import Camera


class CameraFactory(DjangoModelFactory):
    """CameraFactory."""

    name = Faker("name")
    rtsp = Faker("url")
    area = Faker("sentence")
    is_demo = False
    location = SubFactory(LocationFactory)

    class Meta:
        model = Camera
        django_get_or_create = ["name"]
