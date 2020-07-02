"""
Serializers
"""

import logging

from django.db.utils import IntegrityError
from rest_framework import serializers

from .models import (Annotation, Camera, Image, Part)

logger = logging.getLogger(__name__)


class PartSerializer(serializers.HyperlinkedModelSerializer):
    """PartSerializer"""
    class Meta:
        model = Part
        fields = ["id", "name", "description", "is_demo"]
        extra_kwargs = {
            "description": {
                "required": False
            },
        }

    def create(self, validated_data):
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


class CameraSerializer(serializers.HyperlinkedModelSerializer):
    """CameraSerializer"""
    class Meta:
        model = Camera
        fields = ["id", "name", "rtsp", "area", "is_demo"]


class ImageSerializer(serializers.HyperlinkedModelSerializer):
    """ImageSerializer"""
    class Meta:
        model = Image
        fields = ["id", "image", "labels", "part", "is_relabel", "confidence"]


class AnnotationSerializer(serializers.HyperlinkedModelSerializer):
    """AnnotationSerializer"""
    class Meta:
        model = Annotation
        fields = ["id", "image", "labels"]
