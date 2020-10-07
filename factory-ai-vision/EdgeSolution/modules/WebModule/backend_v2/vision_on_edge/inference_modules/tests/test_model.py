"""App model tests.
"""

from rest_framework.test import APITransactionTestCase

from ..models import InferenceModule


class InferenceModuleTestCase(APITransactionTestCase):
    """InferenceModuleTestCase.

    App Model testcases.
    """

    def setUp(self):
        """setUp."""
        InferenceModule.objects.create(name="InferenceModule1", url="localhost:5000")
