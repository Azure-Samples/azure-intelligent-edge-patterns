# -*- coding: utf-8 -*-
"""App exceptions.
"""

from rest_framework.exceptions import APIException


class CannotChangeDemoPartError(APIException):
    status_code = 400
    default_detail = "Demo part should not change"
    default_code = "cannot_change_demo_part_error"


class NoNoneDemoProjectExistsError(APIException):
    status_code = 400
    default_detail = "part.project is empty and no none-demo project"
    default_code = "no_none_demo_project_exists_error"


class MultiNoneDemoProjectExistsError(APIException):
    status_code = 400
    default_detail = "part.project is empty and multi none-demo project"
    default_code = "multi_none_demo_project_exists_error"


class SamePartExistError(APIException):
    status_code = 400
    default_detail = "Same part name already exist."
    default_code = "same_part_name_exists_in_project_error."
