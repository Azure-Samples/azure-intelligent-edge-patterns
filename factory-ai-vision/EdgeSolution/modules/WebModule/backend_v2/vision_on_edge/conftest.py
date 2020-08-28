# -*- coding: utf-8 -*-
"""Conftest
"""

import pytest

from vision_on_edge.azure_parts.models import Part
from vision_on_edge.azure_parts.tests.factories import PartFactory
from vision_on_edge.azure_projects.models import Project
from vision_on_edge.azure_projects.tests.factories import ProjectFactory
from vision_on_edge.azure_settings.models import Setting
from vision_on_edge.azure_settings.tests.factories import SettingFactory
from vision_on_edge.azure_training_status.models import TrainingStatus
from vision_on_edge.azure_training_status.tests.factories import \
    TrainingStatusFactory
from vision_on_edge.images.models import Image
from vision_on_edge.images.tests.factories import ImageFactory
from vision_on_edge.locations.models import Location
from vision_on_edge.locations.tests.factories import LocationFactory
from vision_on_edge.cameras.models import Camera
from vision_on_edge.cameras.tests.factories import CameraFactory


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
    return SettingFactory()


@pytest.fixture
def project() -> Project:
    return ProjectFactory()


@pytest.fixture
def status() -> TrainingStatus:
    return TrainingStatusFactory()


@pytest.fixture
def location() -> Location:
    return LocationFactory()


@pytest.fixture
def part() -> Part:
    return PartFactory()


@pytest.fixture
def image() -> Image:
    return ImageFactory()

@pytest.fixture
def camera() -> Camera:
    return CameraFactory()
