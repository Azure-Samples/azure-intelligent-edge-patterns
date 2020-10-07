"""
Feedback model testcase
"""

from rest_framework.test import APITransactionTestCase

from ..models import Feedback


class FeedbackModelTestCases(APITransactionTestCase):
    """
    Feedback model testcase
    """

    def setUp(self):
        Feedback.objects.create(satisfaction="GD")
        Feedback.objects.create(satisfaction="EX")
        self.exist_num = 2

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """
        self.assertEqual(Feedback.objects.count(), self.exist_num)
