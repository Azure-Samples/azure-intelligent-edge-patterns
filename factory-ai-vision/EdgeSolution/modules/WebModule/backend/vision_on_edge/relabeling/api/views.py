"""
Relabel views
"""

import base64
import datetime
import io
import logging

from django.core.files.images import ImageFile
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ...azure_parts.models import Part
from ...azure_training.models import Project
from ...images.models import Image

logger = logging.getLogger(__name__)


@api_view(["POST"])
def upload_relabel_image(request):
    """upload relable image"""
    part_name = request.data["part_name"]
    labels = request.data["labels"]
    img_data = base64.b64decode(request.data["img"])
    confidence = request.data["confidence"]
    # is_relabel = request.data["is_relabel"]

    # FIXME: Inferenece should send request using part id instead of part_name
    parts = Part.objects.filter(name=part_name, is_demo=False)
    if len(parts) == 0:
        logger.error("Unknown Part Name: %s", part_name)
        return Response({"status": "failed"})

    part = parts[0]
    # FIXME: use part foreign key to get project
    project_objs = Project.objects.filter(is_demo=part.is_demo)
    if len(project_objs) <= 0:
        logger.error("Cannot found project objects")
        return Response(
            {
                "status": "failed",
                "log": "Cannot found project objects"
            },
            status=status.HTTP_400_BAD_REQUEST)

    project_obj = project_objs[0]

    # Relabel images count exceed project.maxImages
    if project_obj.maxImages <= len(
            Image.objects.filter(
                project=project_obj, part=part, is_relabel=True)):
        logger.info("Already reach project maxImages limit")

        # Delete some images if already exceed maxImages
        for i in range(
                len(
                    Image.objects.filter(
                        project=project_obj, part=part, is_relabel=True)) -
                project_obj.maxImages):
            Image.objects.filter(project=project_obj,
                                 part=part,
                                 is_relabel=True).last().delete()
        return Response(
            {
                "status": "failed",
                'log': 'Already reach project maxImages limit'
            },
            status=status.HTTP_400_BAD_REQUEST)

    # Relabel images count does not exceed project.maxImages
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


@api_view(["POST"])
def relabel_update(request):
    """
    Update relabel image
    """
    logger.info("update relabeling")
    data = request.data
    if type(data) is not type([]):
        logger.info("data should be array of object {}")
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
