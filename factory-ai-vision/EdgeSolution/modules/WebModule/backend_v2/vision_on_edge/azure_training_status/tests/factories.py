"""Status Factories
"""

from typing import Any, Sequence

import factory
from factory import DjangoModelFactory, Faker, post_generation

from vision_on_edge.azure_projects.tests.factories import ProjectFactory
from vision_on_edge.azure_training_status.models import TrainingStatus


class TrainingStatusFactory(DjangoModelFactory):
    """TrainingStatusFactory.
    """

    my_status_list = ['ok', 'failed', 'preparing', 'training', 'exporting']

    name = Faker("city")
    status = Faker("word", ext_word_list=my_status_list)
    log = Faker("sentence")
    need_to_send_notification = Faker("pybool")
    project = factory.SubFactory(ProjectFactory)

    class Meta:
        """Meta.
        """

        model = TrainingStatus
        django_get_or_create = ["project"]
