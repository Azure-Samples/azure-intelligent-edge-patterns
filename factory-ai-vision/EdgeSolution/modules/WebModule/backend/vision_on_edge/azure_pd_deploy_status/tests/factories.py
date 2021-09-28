"""App model factories
"""

from factory import DjangoModelFactory, Faker, SubFactory

from ...azure_projects.tests.factories import ProjectFactory
from ...azure_training_status.models import TrainingStatus


class TrainingStatusFactory(DjangoModelFactory):
    """TrainingStatusFactory."""

    my_status_list = ["ok", "Failed", "Preparing", "Training", "Exporting"]

    name = Faker("city")
    status = Faker("word", ext_word_list=my_status_list)
    log = Faker("sentence")
    need_to_send_notification = Faker("pybool")
    project = SubFactory(ProjectFactory)

    class Meta:
        """Meta."""

        model = TrainingStatus
        django_get_or_create = ["project"]
