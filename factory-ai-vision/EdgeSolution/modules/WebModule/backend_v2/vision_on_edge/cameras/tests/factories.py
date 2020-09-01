# -*- coding: utf-8 -*-
"""App Model Factories
"""

import factory
from factory import DjangoModelFactory, Faker

from ...locations.tests.factories import LocationFactory
from ..models import Camera


class CameraFactory(DjangoModelFactory):
    """CameraFactory.
    """

    name = Faker("name")
    rtsp = Faker("url")
    area = Faker("sentence")
    is_demo = False
    location = factory.SubFactory(LocationFactory)

    class Meta:
        model = Camera
        django_get_or_create = ["name"]
