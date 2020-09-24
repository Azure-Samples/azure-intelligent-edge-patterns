"""App REST API Test
"""

from rest_framework.test import APITransactionTestCase

from ..models import InferenceModule


class InferenceModuleRestTestCases(APITransactionTestCase):
    """InferenceModuleRestTestCases

    InferenceModule REST API testcases.
    """

    def setUp(self):
        """setUp."""
        InferenceModule.objects.create(name="InferenceModule1", url="localhost:5000")

    def test_setup_is_valid(self):
        """test_setup_is_valid.

        Make sure setup is valid
        """
        self.assertEqual(InferenceModule.objects.count(), 1)
