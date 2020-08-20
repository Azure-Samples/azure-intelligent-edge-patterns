"""Azure Notification Factories
"""

from factory import DjangoModelFactory, Faker

from vision_on_edge.notifications.models import Notification


class NotificationFactory(DjangoModelFactory):
    """NotificationFactory.
    """

    notification_type = "project"
    sender = "system"
    title = Faker("word")
    details = Faker("sentence")

    class Meta:
        """Meta.
        """

        model = Notification
