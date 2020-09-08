# -*- coding: utf-8 -*-
"""Custom yasg schema.
"""

from drf_yasg.inspectors import SwaggerAutoSchema


class StreamAutoSchema(SwaggerAutoSchema):
    """StreamAutoSchema.
    """

    def get_produces(self):
        """get_produces.
        """
        return ["multipart/x-mixed-replace;boundary=frame"]

    def get_consumes(self):
        """get_consumes.
        """
        return ["multipart/x-mixed-replace;boundary=frame"]
