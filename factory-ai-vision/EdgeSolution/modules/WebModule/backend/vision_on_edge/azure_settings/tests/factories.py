"""Azure Setting Factories
"""

from typing import Any, Sequence

from factory import DjangoModelFactory, Faker, post_generation

from vision_on_edge.azure_settings.models import Setting


class SettingFactory(DjangoModelFactory):

    name = Faker("city")
    endpoint = Faker("url")
    training_key = Faker("md5")

    class Meta:
        model = Setting
        django_get_or_create = ["name"]
