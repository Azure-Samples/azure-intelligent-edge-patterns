"""Conftest
"""

import pytest

from vision_on_edge.azure_parts.models import Part
from vision_on_edge.azure_parts.tests.factories import PartFactory
from vision_on_edge.azure_settings.models import Setting
from vision_on_edge.azure_settings.tests.factories import SettingFactory
from vision_on_edge.azure_projects.models import Project
from vision_on_edge.azure_projects.tests.factories import ProjectFactory
from vision_on_edge.azure_training_status.models import TrainingStatus
from vision_on_edge.azure_training_status.tests.factories import \
    TrainingStatusFactory
from vision_on_edge.images.models import Image
from vision_on_edge.images.tests.factories import ImageFactory
from vision_on_edge.locations.models import Location
from vision_on_edge.locations.tests.factories import LocationFactory


@pytest.fixture(autouse=True)
def media_storage(settings, tmpdir):
    """media_storage.

    Args:
        settings:
        tmpdir:
    """
    settings.MEDIA_ROOT = tmpdir.strpath


@pytest.fixture
def setting() -> Setting:
    """setting.

    Args:

    Returns:
        Setting:
    """
    return SettingFactory()


@pytest.fixture
def project() -> Project:
    """project.

    Args:

    Returns:
        Project:
    """
    return ProjectFactory()


@pytest.fixture
def status() -> TrainingStatus:
    """status.

    Args:

    Returns:
        TrainingStatus:
    """
    return TrainingStatusFactory()


@pytest.fixture
def location() -> Location:
    """location.

    Args:

    Returns:
        Location:
    """
    return LocationFactory()


@pytest.fixture
def part() -> Part:
    """part.

    Args:

    Returns:
        Part:
    """
    return PartFactory()


@pytest.fixture
def image() -> Image:
    """image.

    Args:

    Returns:
        Image:
    """
    return ImageFactory()
