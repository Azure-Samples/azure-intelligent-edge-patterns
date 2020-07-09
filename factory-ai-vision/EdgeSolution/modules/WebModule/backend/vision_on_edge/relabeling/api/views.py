"""
Relabel views
"""

import base64
import datetime
import io
import logging

from django.core.files.images import ImageFile
from django.http import JsonResponse
from rest_framework.decorators import api_view

from ...azure_training.models import Image
from ...parts.models import Part

logger = logging.getLogger(__name__)


@api_view(["POST"])
def upload_relabel_image(request):
    """upload relable image"""
    part_name = request.data["part_name"]
    labels = request.data["labels"]
    img_data = base64.b64decode(request.data["img"])
    confidence = request.data["confidence"]
    # is_relabel = request.data["is_relabel"]

    parts = Part.objects.filter(name=part_name, is_demo=False)
    if len(parts) == 0:
        logger.error("Unknown Part Name: %s", part_name)
        return JsonResponse({"status": "failed"})

    img_io = io.BytesIO(img_data)

    img = ImageFile(img_io)
    img.name = datetime.datetime.utcnow().isoformat() + ".jpg"
    img_obj = Image(
        image=img,
        part_id=parts[0].id,
        labels=labels,
        confidence=confidence,
        is_relabel=True,
    )
    img_obj.save()

    return JsonResponse({"status": "ok"})


@api_view(["POST"])
def relabel_update(request):
    """
    Update relabel image
    """
    logger.info("update relabeling")
    data = request.data
    if type(data) is not type([]):
        logger.info("data should be array of object {}")
        return JsonResponse({"status": "failed"})

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

    return JsonResponse({"status": "ok"})
