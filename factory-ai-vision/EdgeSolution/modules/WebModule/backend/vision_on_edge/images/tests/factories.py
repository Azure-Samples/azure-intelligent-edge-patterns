"""Image Factories
"""


from factory import DjangoModelFactory, Faker, SubFactory, post_generation

from ...azure_parts.tests.factories import PartFactory
from ...azure_projects.tests.factories import ProjectFactory
from ..models import Image


class ImageFactory(DjangoModelFactory):
    """ImageFactory."""

    project = SubFactory(ProjectFactory)
    part = SubFactory(PartFactory)
    remote_url = Faker("image_url")

    class Meta:
        """Meta."""

        model = Image
        django_get_or_create = ["remote_url"]

    @post_generation
    def post(obj, *args, **kwargs):
        """post.

        Args:
            obj:
            args:
            kwargs:
        """
        obj.get_remote_image()
