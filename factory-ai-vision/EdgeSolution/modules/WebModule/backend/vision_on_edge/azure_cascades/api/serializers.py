"""App serializers.
"""

import logging

from rest_framework import serializers
from ..models import Cascade


logger = logging.getLogger(__name__)





class CascadeSerializer(serializers.ModelSerializer):
    '''cascade serializer
    '''
    class Meta:
        model = Cascade
        fields = "__all__"
