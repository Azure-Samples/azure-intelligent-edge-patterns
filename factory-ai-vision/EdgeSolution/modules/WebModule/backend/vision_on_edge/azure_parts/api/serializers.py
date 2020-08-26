"""
App serializers
"""

import logging

from django.db.utils import IntegrityError
from rest_framework import serializers

from ..models import Part

logger = logging.getLogger(__name__)


class PartSerializer(serializers.ModelSerializer):
    """PartSerializer.
    """

    class Meta:
        """Meta.
        """

        model = Part
        fields = "__all__"
        extra_kwargs = {
            "description": {
                "required": False
            },
        }

    def create(self, validated_data):
        """create.

        Args:
            validated_data:
        """

        try:
            return Part.objects.create(**validated_data)
        except IntegrityError:
            raise serializers.ValidationError(
                detail={
                    "status":
                        "failed",
                    "log": ("dataset with same name exists," +
                            "please change another name"),
                })
        except:
            logger.exception("Part update occur uncaught error")
            raise serializers.ValidationError(detail={
                "status": "failed",
                "log": "Unexpected Error"
            })

    def update(self, instance, validated_data):
        """update.

        Args:
            instance:
            validated_data:
        """

        try:
            result = super().update(instance, validated_data)
            return result
        except IntegrityError:
            raise serializers.ValidationError(
                detail={
                    "status":
                        "failed",
                    "log": ("dataset with same name exists, " +
                            "please change another name"),
                })
        except:
            logger.exception("Part update occur uncaught error")
            raise serializers.ValidationError(detail={
                "status": "failed",
                "log": "Unexpected Error"
            })
