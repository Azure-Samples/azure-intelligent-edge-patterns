"""App model tests.
"""

from unittest import mock

import pytest

from ..exceptions import ProjectCustomVisionError
from .factories import ProjectFactory

pytestmark = pytest.mark.django_db


class MockedProject:
    """MockedProject.

    Mocked project object for return value
    """

    def __init__(self):
        self.name = "mocked project name"


@mock.patch(
    "vision_on_edge.azure_projects.models.Project.get_project_obj",
    mock.MagicMock(return_value=MockedProject()),
)
def test_create_1():
    """test_create_1.

    Type:
        Negative

    Description:
        Create projet given invalid/null azure_setting
    """
    project = ProjectFactory()
    project.customvision_id = "valid_project_id"
    project.name = "wrong project name"
    project.save()
    assert project.customvision_id == "valid_project_id"
    assert project.name == "mocked project name"


@mock.patch(
    "vision_on_edge.azure_projects.models.Project.get_project_obj",
    mock.MagicMock(side_effect=ProjectCustomVisionError),
)
def test_create_2():
    """test_create_1.

    Type:
        Negative

    Description:
        Create projet given invalid customvision_id
    """
    project = ProjectFactory()
    project.customvision_id = "super_valid_project_id"
    project.name = "Random"
    project.save()
    assert project.customvision_id == ""
    assert project.name == "Random"


def test_create_project_with_null_setting():
    """test_create_1.

    Type:
        Negative

    Description:
        Create project with null setting
    """
    project = ProjectFactory()
    project.customvision_id = "super_valid_project_id"
    project.name = "Random"
    project.setting = None
    project.save()
    assert project.customvision_id == ""
    assert project.name == "Random"


def test_update_invalid_customvision_id():
    """test_update_invalid_customvision_id.

    If project from valid id to invalid id. customvision_id set to ""
    """
    project = ProjectFactory()
    with mock.patch(
        "vision_on_edge.azure_projects.models.Project.get_project_obj",
        mock.MagicMock(return_value=MockedProject()),
    ):
        project.customvision_id = "super_valid_project_id"
        project.name = "Random"
        project.save()
        assert project.customvision_id == "super_valid_project_id"
        assert project.name == "mocked project name"
    with mock.patch(
        "vision_on_edge.azure_projects.models.Project.get_project_obj",
        mock.MagicMock(side_effect=ProjectCustomVisionError),
    ):
        project.customvision_id = "invalid_project_id"
        project.name = "Random2"
        project.save()
    assert project.customvision_id == ""
    assert project.name == "Random2"


def test_update_valid_customvision_id():
    """test_create_1.

    If project from valid id to invalid id. customvision_id set to ""
    """
    project = ProjectFactory()
    project.customvision_id = "super_valid_project_id"
    project.name = "Random"
    project.save()
    assert project.customvision_id == ""
    assert project.name == "Random"
    with mock.patch(
        "vision_on_edge.azure_projects.models.Project.get_project_obj",
        mock.MagicMock(return_value=MockedProject()),
    ):
        project.customvision_id = "new_project_id"
        project.name = "Name that should be replaced"
        project.save()
    assert project.customvision_id == "new_project_id"
    assert project.name == "mocked project name"
