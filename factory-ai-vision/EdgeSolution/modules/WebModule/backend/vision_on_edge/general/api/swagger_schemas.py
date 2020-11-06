"""Custom yasg schema.
"""

from drf_yasg2.inspectors import SwaggerAutoSchema


class StreamAutoSchema(SwaggerAutoSchema):
    """StreamAutoSchema."""

    def get_produces(self):
        """get_produces."""
        return ["application/json"]

    def get_consumes(self):
        """get_consumes."""
        return ["multipart/x-mixed-replace;boundary=frame"]
