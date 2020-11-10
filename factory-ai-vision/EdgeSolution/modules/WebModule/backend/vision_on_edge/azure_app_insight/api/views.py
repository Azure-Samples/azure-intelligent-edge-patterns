"""App API views.
"""

from drf_yasg2.utils import swagger_auto_schema
from rest_framework.decorators import api_view
from rest_framework.response import Response

from configs.app_insight import APP_INSIGHT_INST_KEY

from ...general.api.serializers import MSStyleErrorResponseSerializer
from .serializers import InstrumentKeyResponseSerializer


@swagger_auto_schema(
    method="get",
    operation_summary="Get Application Insight Instrument Key.",
    responses={
        "200": InstrumentKeyResponseSerializer,
        "400": MSStyleErrorResponseSerializer,
    },
)
@api_view(["GET"])
def key_view(request) -> Response:
    """instrumentation_key.

    Args:
        request:

    Returns:
        Response:
    """
    res_data = {"status": "ok", "key": APP_INSIGHT_INST_KEY}
    serializers = InstrumentKeyResponseSerializer(data=res_data)
    serializers.is_valid(raise_exception=True)
    return Response(data=serializers.validated_data)
