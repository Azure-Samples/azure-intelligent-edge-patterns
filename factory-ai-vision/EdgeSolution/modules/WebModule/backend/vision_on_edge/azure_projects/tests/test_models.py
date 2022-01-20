"""App model tests.
"""

from unittest import mock

import pytest

from ..exceptions import (
    ProjectCannotChangeDemoError,
    ProjectCustomVisionError,
    ProjectTrainWithoutParts,
    ProjectWithoutSettingError,
)
from .conftest import MockedProject
from .factories import ProjectFactory

pytestmark = pytest.mark.django_db


def test_create_project_with_valid_id():
    """Make sure create project given valid azure_setting."""
    project = ProjectFactory(
        customvision_id="valid_project_id", name="wrong project name"
    )
    assert project.customvision_id == "valid_project_id"
    assert project.name == MockedProject().name


@mock.patch(
    "vision_on_edge.azure_projects.models.Project.get_project_obj",
    mock.MagicMock(side_effect=ProjectCustomVisionError),
)
def test_create_project_with_invalid_id():
    """Create project given invalid customvision_id."""
    project = ProjectFactory(customvision_id="super_valid_project_id", name="Random")
    assert project.customvision_id == ""
    assert project.name == "Random"


@mock.patch(
    "vision_on_edge.azure_projects.models.Project.get_project_obj",
    mock.MagicMock(side_effect=ProjectWithoutSettingError),
)
def test_create_project_with_null_setting():
    """Create project with null setting."""
    project = ProjectFactory(
        customvision_id="super_valid_project_id", name="Random", setting=None
    )
    assert project.customvision_id == ""
    assert project.name == "Random"


def test_update_invalid_customvision_id():
    """test_update_invalid_customvision_id.

    If project from valid id to invalid id. customvision_id set to ""
    """
    project = ProjectFactory(customvision_id="super_valid_project_id", name="Random")
    assert project.customvision_id == "super_valid_project_id"
    assert project.name == MockedProject().name

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
    """test_update_valid_customvision_id

    If update project with invalid custom vision ids, id would be set to empty string.
    """
    with mock.patch(
        "vision_on_edge.azure_projects.models.Project.get_project_obj",
        mock.MagicMock(side_effect=ProjectWithoutSettingError),
    ):
        project = ProjectFactory(
            customvision_id="super_valid_project_id", name="Random"
        )
        assert project.customvision_id == ""
        assert project.name == "Random"

    project.customvision_id = "new_project_id"
    project.name = "Name that should be replaced"
    project.save()
    assert project.customvision_id == "new_project_id"
    assert project.name == MockedProject().name


@pytest.mark.fast
def test_get_project():
    project = ProjectFactory()
    assert project.get_project_obj().name == MockedProject().name


@pytest.mark.fast
def test_project_is_trainable():
    project = ProjectFactory()
    assert not project.is_trainable()
    with pytest.raises(ProjectTrainWithoutParts):
        project.is_trainable(raise_exception=True)


@pytest.mark.fast
def test_demo_project_is_trainable(demo_project):
    assert not demo_project.is_trainable()
    with pytest.raises(ProjectCannotChangeDemoError):
        demo_project.is_trainable(raise_exception=True)


@pytest.mark.fast
def test_is_deployable():
    project = ProjectFactory()
    assert not project.is_deployable()
    with pytest.raises(ProjectTrainWithoutParts):
        project.is_deployable(raise_exception=True)


@pytest.mark.fast
def test_demo_project_is_deployable(demo_project):
    assert demo_project.is_deployable()
    assert demo_project.is_deployable(raise_exception=True)
