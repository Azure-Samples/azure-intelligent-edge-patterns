import pytest

from vision_on_edge.azure_settings.models import Setting
from vision_on_edge.locations.models import Location
from vision_on_edge.azure_parts.models import Part
from vision_on_edge.locations.tests.factories import LocationFactory
from vision_on_edge.azure_parts.tests.factories import PartFactory
from vision_on_edge.azure_settings.tests.factories import SettingFactory

@pytest.fixture(autouse=True)
def media_storage(settings, tmpdir):
    settings.MEDIA_ROOT = tmpdir.strpath

@pytest.fixture
def setting() -> Setting:
    return SettingFactory()

@pytest.fixture
def location() -> Location:
    return LocationFactory()

@pytest.fixture
def part() -> Part:
    return PartFactory()
