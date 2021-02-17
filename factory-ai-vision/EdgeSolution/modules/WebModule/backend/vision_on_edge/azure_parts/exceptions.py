"""App exceptions.
"""

from rest_framework.exceptions import APIException


class PartCannotChangeDemoError(APIException):
    status_code = 400
    default_detail = "Demo part should not change."
    default_code = "part_cannot_change_demo_error"


class PartNoNoneDemoProjectExistsError(APIException):
    status_code = 400
    default_detail = "part.project is empty and no none-demo project."
    default_code = "part_no_none_demo_project_exists_error"


class PartMultiNoneDemoProjectExistsError(APIException):
    status_code = 400
    default_detail = "part.project is empty and multi none-demo project."
    default_code = "part_multi_none_demo_project_exists_error"


class PartSameNameExistError(APIException):
    status_code = 400
    default_detail = "This part name already exists, please try another name."
    default_code = "part_same_name_exists_in_project_error."


class PartNotEnoughImagesToTrain(APIException):
    status_code = 400
    default_detail = "This part does not have enough images to train. Please upload or capture more images."  # noqa: E501
    default_code = "part_not_enough_images_to_train."
