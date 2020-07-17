"""App Serializers.
"""

import logging

from rest_framework import serializers

from ..models import Setting

logger = logging.getLogger(__name__)


class SettingSerializer(serializers.ModelSerializer):
    """SettingSerializer.
    """

    class Meta:
        """Meta.
        """

        model = Setting
        fields = "__all__"

    def create(self, validated_data):
        """create.

        Args:
            validated_data:
        """

        obj, _ = Setting.objects.get_or_create(
            endpoint=validated_data["endpoint"],
            training_key=validated_data["training_key"],
            defaults={
                "name":
                    validated_data["name"],
                "iot_hub_connection_string":
                    validated_data["iot_hub_connection_string"],
                "device_id":
                    validated_data["device_id"],
                "module_id":
                    validated_data["module_id"],
                "is_collect_data":
                    validated_data["is_collect_data"],
            },
        )
        return obj
