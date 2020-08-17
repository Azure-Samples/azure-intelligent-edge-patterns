# -*- coding: utf-8 -*-
"""Azure Notification Factories
"""

from django.utils import timezone
from factory import DjangoModelFactory, Faker

from vision_on_edge.notifications.models import Notification


class NotificationFactory(DjangoModelFactory):
    """NotificationFactory.
    """

    notification_type = "project"
    sender = "system"
    title = Faker("word")
    details = Faker("sentence")
    timestamp = timezone.now()

    class Meta:
        model = Notification
