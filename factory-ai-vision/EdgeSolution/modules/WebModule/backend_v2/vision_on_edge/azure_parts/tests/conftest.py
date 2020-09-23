"""Conftest
"""

from unittest import mock


# pylint: disable=too-few-public-methods
class FakeProject:
    """FakeProject.

    Fake project object for mocking return value
    """

    def __init__(self):
        self.name = "Fake Project"


mock.patch(
    "vision_on_edge.azure_settings.models.Setting.validate",
    mock.MagicMock(return_value=True),
).start()
mock.patch(
    "vision_on_edge.azure_settings.models.Setting.get_domain_id",
    mock.MagicMock(return_value="Fake_id"),
).start()
mock.patch(
    "vision_on_edge.azure_projects.models.Project.get_project_obj",
    mock.MagicMock(return_value=FakeProject()),
).start()
