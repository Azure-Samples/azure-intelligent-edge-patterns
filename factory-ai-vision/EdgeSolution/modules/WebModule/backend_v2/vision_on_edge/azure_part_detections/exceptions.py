# -*- coding: utf-8 -*-
"""App exceptions.
"""

from rest_framework.exceptions import APIException


# pylint: disable=line-too-long
class PdProbThresholdNotInteger(APIException):

    status_code = 400
    default_detail = "Prob_threshold must be given as Integer."
    default_code = "pd_prob_threshold_not_integer"


class PdProbThresholdOutOfRange(APIException):

    status_code = 400
    default_detail = "Prob_threshold must be between 0-100."
    fault_code = "pd_prob_threshold_out_of_range"

class PdConfigureWithoutInferenceModule(APIException):

    status_code = 400
    default_detail = "Please set inference module before configure/deploy."
    default_code = "pd_configure_without_inference_module"


class PdConfigureWithoutProject(APIException):

    status_code = 400
    default_detail = "Please set project/model before configure/deploy."
    default_code = "pd_configure_without_project"

class PdConfigureWithoutCameras(APIException):

    status_code = 400
    default_detail = "Please set cameras before configure/deploy."
    default_code = "pd_configure_without_cameras"
