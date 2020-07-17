"""App views"""

from rest_framework.decorators import api_view
from rest_framework.response import Response

from configs.app_insight import APP_INSIGHT_INST_KEY


@api_view()
def instrumentation_key(request) -> Response:
    """instrumentation_key.

    Args:
        request:

    Returns:
        Response:
    """
    return Response({"status": "ok", "key": APP_INSIGHT_INST_KEY})
