import pytest

from vision_on_edge.locations.models import Location
from vision_on_edge.locations.tests.factories import LocationFactory

@pytest.fixture(autouse=True)
def media_storage(settings, tmpdir):
    settings.MEDIA_ROOT = tmpdir.strpath


@pytest.fixture
def location() -> Location:
    return LocationFactory()
