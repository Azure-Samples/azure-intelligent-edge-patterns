"""App model tests.
"""

from unittest import mock

import pytest

from ..exceptions import ProjectCustomVisionError
from .factories import ProjectFactory

pytestmark = pytest.mark.django_db

# pylint: disable=too-few-public-methods
class FakeProject:
    """FakeProject.

    Fake project object for mocking return value
    """

    def __init__(self):
        self.name = "Fake Project"


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.validate",
    mock.MagicMock(return_value=True),
)
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.get_domain_id",
    mock.MagicMock(return_value="Fake_id"),
)
@mock.patch(
    "vision_on_edge.azure_projects.models.Project.get_project_obj",
    mock.MagicMock(return_value=FakeProject()),
)
def test_create_1():
    """test_create_1.

    Type:
        Negative

    Description:
        Create projet given invalid/null azure_setting
    """
    project = ProjectFactory()
    project.customvision_id = "super_valid_project_id"
    project.name = "Random"
    project.save()
    assert project.customvision_id == "super_valid_project_id"
    assert project.name == "Fake Project"


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.validate",
    mock.MagicMock(return_value=True),
)
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.get_domain_id",
    mock.MagicMock(return_value="Fake_id"),
)
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


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.validate",
    mock.MagicMock(return_value=True),
)
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.get_domain_id",
    mock.MagicMock(return_value="Fake_id"),
)
def test_create_3():
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


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.validate",
    mock.MagicMock(return_value=True),
)
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.get_domain_id",
    mock.MagicMock(return_value="Fake_id"),
)
@mock.patch(
    "vision_on_edge.azure_projects.models.Project.get_project_obj",
    mock.MagicMock(return_value=FakeProject()),
)
def test_update_1():
    """test_create_1.

    Type:
        Negative

    Description:
        If project from valid id to invalid id. customvision_id set to ""
    """
    project = ProjectFactory()
    project.customvision_id = "super_valid_project_id"
    project.name = "Random"
    project.save()
    assert project.customvision_id == "super_valid_project_id"
    assert project.name == "Fake Project"
    with mock.patch(
        "vision_on_edge.azure_projects.models.Project.get_project_obj",
        mock.MagicMock(side_effect=ProjectCustomVisionError),
    ):
        project.customvision_id = "invalid_project_id"
        project.name = "Random2"
        project.save()
    assert project.customvision_id == ""
    assert project.name == "Random2"


@pytest.mark.fast
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.validate",
    mock.MagicMock(return_value=True),
)
@mock.patch(
    "vision_on_edge.azure_settings.models.Setting.get_domain_id",
    mock.MagicMock(return_value="Fake_id"),
)
@mock.patch(
    "vision_on_edge.azure_projects.models.Project.get_project_obj",
    mock.MagicMock(side_effect=ProjectCustomVisionError),
)
def test_update_2():
    """test_create_1.

    Type:
        Negative

    Description:
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
        mock.MagicMock(return_value=FakeProject()),
    ):
        project.customvision_id = "new_project_id"
        project.name = "Name that should be replaced"
        project.save()
    assert project.customvision_id == "new_project_id"
    assert project.name == "Fake Project"
