"""App model factories.
"""

from factory import DjangoModelFactory, Faker

from ...azure_settings.models import Setting


class SettingFactory(DjangoModelFactory):
    """SettingFactory."""

    name = Faker("city")
    endpoint = Faker("url")
    training_key = Faker("md5")

    class Meta:
        model = Setting
        django_get_or_create = ["name"]
