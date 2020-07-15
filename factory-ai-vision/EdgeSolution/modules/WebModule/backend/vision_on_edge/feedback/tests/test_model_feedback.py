"""
Feedback model testcase
"""
from unittest.mock import patch

from rest_framework.test import APITransactionTestCase

from vision_on_edge.general.tests.test_special_strings import special_strings

from ..models import Feedback


class FeedbackModelTestCases(APITransactionTestCase):
    """
    Feedback model testcase
    """

    def setUp(self):
        Feedback.objects.create(satisfaction='GD',
                                description='good test')
        Feedback.objects.create(satisfaction='EX',
                                description='excellent test')
        for special_string in special_strings:
            Feedback.objects.create(satisfaction=special_string,
                                    description=special_string)
        self.exist_num = 2 + len(special_strings)

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """
        self.assertEqual(Feedback.objects.count(), self.exist_num)
