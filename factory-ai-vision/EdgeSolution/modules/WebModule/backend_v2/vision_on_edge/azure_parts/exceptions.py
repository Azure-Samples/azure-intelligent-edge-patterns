"""App exceptions.
"""

from rest_framework.exceptions import APIException


class PartCannotChangeDemoError(APIException):
    status_code = 400
    default_detail = "Demo part should not change"
    default_code = "cannot_change_demo_part_error"


class PartNoNoneDemoProjectExistsError(APIException):
    status_code = 400
    default_detail = "part.project is empty and no none-demo project"
    default_code = "no_none_demo_project_exists_error"


class PartMultiNoneDemoProjectExistsError(APIException):
    status_code = 400
    default_detail = "part.project is empty and multi none-demo project"
    default_code = "multi_none_demo_project_exists_error"


class PartSameNameExistError(APIException):
    status_code = 400
    default_detail = "This part name already exists, please try another name."
    default_code = "same_part_name_exists_in_project_error."
