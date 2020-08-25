"""
Relabel views
"""

import base64
import datetime
import io
import logging

from django.core.files.images import ImageFile
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ...azure_parts.models import Part
from ...azure_projects.models import Project
from ...images.models import Image

logger = logging.getLogger(__name__)


@api_view(["POST"])
def upload_relabel_image(request):
    """upload_relabel_image.

    Args:
        request:
    """

    part_name = request.data["part_name"]
    labels = request.data["labels"]
    img_data = base64.b64decode(request.data["img"])
    confidence = request.data["confidence"]
    # is_relabel = request.data["is_relabel"]

    # FIXME: Inferenece should send request using part id instead of part_name
    parts = Part.objects.filter(name=part_name, project__is_demo=False)
    if len(parts) == 0:
        logger.error("Unknown Part Name: %s", part_name)
        return Response({"status": "failed"})

    part = parts[0]

    project_obj = part.project
    if project_obj is None:
        logger.error("Cannot found project objects")
        return Response(
            {
                "status": "failed",
                "log": "Cannot found project objects"
            },
            status=status.HTTP_400_BAD_REQUEST)

    # Relabel images count does not exceed project.maxImages
    # Handled by signals

    confidence_float = float(confidence) * 100
    # Confidence check
    if (confidence_float < project_obj.accuracyRangeMin or \
         confidence_float > project_obj.accuracyRangeMax):
        logger.error("Inferenece confidence %s out of range", confidence_float)
        logger.error("range %s ~ %s", project_obj.accuracyRangeMin,
                     project_obj.accuracyRangeMax)

        return Response(
            {
                "status": "failed",
                'log': 'Confidence out of range',  # yapf...
            },
            status=status.HTTP_400_BAD_REQUEST)

    # Relabel images count does not exceed project.maxImages
    if project_obj.maxImages > Image.objects.filter(
            project=project_obj, part=part, is_relabel=True).count():

        img_io = io.BytesIO(img_data)
        img = ImageFile(img_io)
        img.name = datetime.datetime.utcnow().isoformat() + ".jpg"
        img_obj = Image(
            image=img,
            part_id=part.id,
            labels=labels,
            confidence=confidence,
            project=project_obj,
            is_relabel=True,
        )
        img_obj.save()
        return Response({"status": "ok"})

    # User is not relabling and exceed maxImages
    # queue...
    logger.info(project_obj.relabel_expired_time)
    logger.info(timezone.now())
    if project_obj.relabel_expired_time < timezone.now():

        logger.info("Queuing relabel images...")
        img_io = io.BytesIO(img_data)
        img = ImageFile(img_io)
        img.name = datetime.datetime.utcnow().isoformat() + ".jpg"
        img_obj = Image(
            image=img,
            part_id=part.id,
            labels=labels,
            confidence=confidence,
            project=project_obj,
            is_relabel=True,
        )
        img_obj.save()
        # pop
        earliest_img = Image.objects.filter(
            project=project_obj, part=part,
            is_relabel=True).order_by("timestamp").first()
        if earliest_img is not None:
            earliest_img.delete()
        return Response({"status": "ok"})
        # return ok
        # pop image

    # User is relabeling and exceed maxImages
    for _ in range(
            Image.objects.filter(
                project=project_obj, part=part, is_relabel=True).count() -
            project_obj.maxImages):
        Image.objects.filter(
            project=project_obj, part=part,
            is_relabel=True).order_by("timestamp").last().delete()
    return Response(
        {
            "status": "failed",
            'log': 'Already reach project maxImages limit while labeling'
        },
        status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def relabel_update(request):
    """relabel_update.

    Args:
        request:
    """

    logger.info("update relabeling")
    data = request.data
    if not isinstance(data, list):
        logger.info("data should be list of object {}")
        return Response({"status": "failed"})

    for item in data:
        image_id = item["imageId"]
        part_id = item["partId"]
        img_obj = Image.objects.get(pk=image_id)
        if part_id is not None:
            img_obj.is_relabel = False
            img_obj.part_id = part_id
            img_obj.save()
            logger.info("image %s with part %s added from relabeling pool",
                        image_id, part_id)
        else:
            img_obj.delete()
            logger.info("image %s removed from relabeling pool", image_id)

    return Response({"status": "ok"})
