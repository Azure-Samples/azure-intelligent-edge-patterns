# -*- coding: utf-8 -*-
"""App exceptions.
"""

from rest_framework.exceptions import APIException, NotFound


# pylint: disable=line-too-long
class PdObjectNotFound(NotFound):
    status_code = 404
    default_detail = "Part Detection object not found."
    default_code = "pd_object_not_found"

class PdProbThresholdNotInteger(APIException):
    status_code = 400
    default_detail = "Prob_threshold must be given as Integer."
    default_code = "pd_prob_threshold_not_integer"


class PdProbThresholdOutOfRange(APIException):
    status_code = 400
    default_detail = "Prob_threshold must be between 0-100."
    default_code = "pd_prob_threshold_out_of_range"


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


class PdInferenceModuleUnreachable(APIException):
    status_code = 503
    default_detail = "Inference module url unreachable."
    default_code = "pd_inference_module_unreachable"


class PdRelabelConfidenceOutOfRange(APIException):
    status_code = 400
    default_detail = "Confidence out of range."
    default_code = "pd_relabel_confidence_out_of_range"


class PdRelabelImageFull(APIException):
    status_code = 400
    default_detail = "Relabel Image reach limit."
    default_code = "pd_relabel_image_full"


class PdDeployToInfereceError(APIException):
    status_code = 503
    default_detail = "Part Detection deploy failed cause Inference Module does not response."
    default_code = "pd_deploy_to_inferece_error"


class PdExportInfereceReadTimeout(APIException):
    status_code = 503
    default_detail = "Part Detection deploy failed cause Inference Module requests timeout."
    default_code = "pd_export_inference_read_timeout"
