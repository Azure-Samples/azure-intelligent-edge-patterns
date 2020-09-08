# -*- coding: utf-8 -*-
"""App exceptions.
"""

from rest_framework.exceptions import APIException


class CannotChangeDemoProjectError(APIException):
    """CannotChangeDemoProjectError.
    """

    status_code = 400
    default_detail = "Demo project should not change."
    default_code = "cannot_change_demo_project"
