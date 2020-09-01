# -*- coding: utf-8 -*-
"""Exceptions
"""

from rest_framework.exceptions import APIException


class CannotChangeDemoPartError(APIException):
    status_code = 400
    default_detail = "Demo part should not change"
    default_code = "cannot_change_demo_part"


class SamePartExistError(APIException):
    status_code = 400
    default_detail = "Same part name already exist."
    default_code = "same_part_name_exists in this project."
