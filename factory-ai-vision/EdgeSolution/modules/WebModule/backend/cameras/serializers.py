"""
Serializers
"""

import logging

from django.db.utils import IntegrityError
from rest_framework import serializers

from .models import (Annotation, Camera, Image, Part, Project, Setting, Task,
                     Train)

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


class TaskSerializer(serializers.HyperlinkedModelSerializer):
    """TaskSerializer"""
    class Meta:
        model = Task
        fields = ["task_type", "status", "log", "project"]


class SettingSerializer(serializers.HyperlinkedModelSerializer):
    """SettingSerializer"""
    class Meta:
        model = Setting
        fields = [
            "id",
            "name",
            "training_key",
            "endpoint",
            "is_trainer_valid",
            "iot_hub_connection_string",
            "device_id",
            "module_id",
            "is_collect_data",
            "obj_detection_domain_id",
        ]

    def create(self, validated_data):
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


class ProjectSerializer(serializers.HyperlinkedModelSerializer):
    """ProjectSerializer"""
    class Meta:
        model = Project
        fields = [
            "setting",
            "id",
            "camera",
            "location",
            "parts",
            "download_uri",
            "customvision_project_id",
            "needRetraining",
            "accuracyRangeMin",
            "accuracyRangeMax",
            "maxImages",
            "metrics_is_send_iothub",
            "metrics_accuracy_threshold",
            "metrics_frame_per_minutes",
            "prob_threshold",
        ]
        extra_kwargs = {
            "setting": {
                "required": False
            },
            "download_uri": {
                "required": False
            },
            "customvision_project_id": {
                "required": False
            },
            "prob_threshold": {
                "required": False
            }
        }

    def create(self, validated_data):
        logger.info("Project Serializer create")
        parts = validated_data.pop("parts")
        if "setting" not in validated_data:
            validated_data["setting"] = Setting.objects.first()
        project = Project.objects.create(**validated_data)
        project.parts.set(parts)
        return project


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


class TrainSerializer(serializers.HyperlinkedModelSerializer):
    """TrainSerializer"""
    class Meta:
        model = Train
        fields = ["id", "status", "log", "project"]
