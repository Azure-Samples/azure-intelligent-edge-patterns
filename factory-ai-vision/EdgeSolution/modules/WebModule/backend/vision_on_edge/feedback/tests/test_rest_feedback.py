"""
Feedback REST API Test
"""
import json
import logging

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITransactionTestCase

from ..models import Feedback

logger = logging.getLogger(__name__)


class FeedbackRestTestCases(APITransactionTestCase):
    """
    Test Cases for Feedback REST API
    """

    def setUp(self):
        logger.warning("Start REST API test")
        url = reverse("api:feedback-list")

        data = {"satisfaction": "PR"}
        self.client.post(url, data, format="json")

        self.exist_num = 1

    def test_setup_is_valid(self):
        """
        Make sure setup is valid
        """
        url = reverse("api:feedback-list")
        response = self.client.get(url, format="json")
        # logger.warning(response.content)
        self.assertEqual(len(json.loads(response.content)), self.exist_num)

    def test_create_feedback_1(self):
        """
        @Type
        Positive

        @Description
        Ensure we can created a feedback by rest api.

        """
        url = reverse("api:feedback-list")
        feedback_sat = "FR"

        data = {"satisfaction": feedback_sat}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(json.loads(response.content)["satisfaction"], feedback_sat)
        # Get feedback list
        response = self.client.get(url, format="json")
        self.assertEqual(len(json.loads(response.content)), self.exist_num + 1)
        # Check using db
        self.assertEqual(Feedback.objects.count(), self.exist_num + 1)
