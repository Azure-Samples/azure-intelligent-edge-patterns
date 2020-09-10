"""
App Insight API_VIEW key test
"""

import json
import logging

from rest_framework import status
from rest_framework.test import APITransactionTestCase

from configs.app_insight import APP_INSIGHT_INST_KEY

logger = logging.getLogger(__name__)


class AppInsightAPIKeyTestCases(APITransactionTestCase):
    """
    App Insight test cases
    """

    def test_can_get_key(self):
        """test_can_get_key.

        Type:
            Positive

        Description:
            Frontend use this api to get key

        Expected Results:
        200 {'status':'ok', 'key': $APP_INSIGHT_INST_KEY}
        """
        response = self.client.get('/api/appinsight/key', format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content)['status'], 'ok')
        self.assertEqual(
            json.loads(response.content)['key'], APP_INSIGHT_INST_KEY)
