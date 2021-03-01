"""Conftest
"""
from unittest import mock

import cv2
import pytest

from .azure_part_detections.models import PartDetection
from .azure_part_detections.tests.factories import PartDetectionFactory
from .azure_parts.models import Part
from .azure_parts.tests.factories import PartFactory
from .azure_projects.models import Project
from .azure_projects.tests.factories import DemoProjectFactory, ProjectFactory
from .azure_settings.models import Setting
from .azure_settings.tests.factories import SettingFactory
from .azure_training_status.models import TrainingStatus
from .azure_training_status.tests.factories import TrainingStatusFactory
from .camera_tasks.models import CameraTask
from .camera_tasks.tests.factories import CameraTaskFactory
from .cameras.models import Camera
from .cameras.tests.factories import CameraFactory
from .images.models import Image
from .images.tests.factories import ImageFactory
from .inference_modules.models import InferenceModule
from .inference_modules.tests.factories import InferenceModuleFactory
from .locations.models import Location
from .locations.tests.factories import LocationFactory


@pytest.fixture(autouse=True)
def media_storage(settings, tmpdir):
    """media_storage.

    Args:
        settings:
        tmpdir:
    """
    settings.MEDIA_ROOT = tmpdir.strpath


img_read = cv2.VideoCapture("vision_on_edge/cameras/tests/test.png").read()


@pytest.fixture(scope="function", autouse=False)
def mock_cv2_capture(monkeypatch):
    # pylint: disable = missing-class-docstring,
    # pylint: invalid-name
    # pylint: missing-function-docstring
    # pylint: no-self-use

    class MockedVideoCap:
        def __init__(self, *args, **kwargs):
            pass

        def isOpened(self):
            return True

        def read(self):
            return img_read

        def release(self):
            pass

    monkeypatch.setattr(
        cv2, "VideoCapture", mock.MagicMock(return_value=MockedVideoCap())
    )


@pytest.fixture
def setting() -> Setting:
    return SettingFactory()


@pytest.fixture
def project() -> Project:
    return ProjectFactory()


@pytest.fixture
def demo_project() -> Project:
    return DemoProjectFactory()


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
def image(mock_cv2_capture) -> Image:
    return ImageFactory()


@pytest.fixture
def inference_module() -> InferenceModule:
    return InferenceModuleFactory()


@pytest.fixture
def camera(mock_cv2_capture) -> Camera:
    return CameraFactory()


@pytest.fixture
def part_detection() -> PartDetection:
    return PartDetectionFactory()


@pytest.fixture
def camera_task(mock_cv2_capture) -> CameraTask:
    return CameraTaskFactory()
