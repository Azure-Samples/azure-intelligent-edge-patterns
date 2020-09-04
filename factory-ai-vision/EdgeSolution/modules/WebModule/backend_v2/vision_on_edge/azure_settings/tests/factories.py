# -*- coding: utf-8 -*-
"""App model factories.
"""

from factory import DjangoModelFactory, Faker

from vision_on_edge.azure_settings.models import Setting


class SettingFactory(DjangoModelFactory):
    """SettingFactory.
    """

    name = Faker("city")
    endpoint = Faker("url")
    training_key = Faker("md5")

    class Meta:
        model = Setting
        django_get_or_create = ["name"]
