"""App utility tests.
"""

from vision_on_edge.azure_parts.models import Part
from vision_on_edge.azure_parts.utils import (
    batch_upload_parts_to_customvision,
    upload_part_to_customvision_helper,
)
from vision_on_edge.azure_projects.models import Project
from vision_on_edge.azure_settings.models import Setting

# def test_upload_single_part():
# """
# Type:
# Positive

# Description:
# Upload single part to Custom Vision
# """
# part_obj = Part.objects.create(name="test_part_1")
# Project.objects.get().create_project()

# upload_part_to_customvision_helper(
# project_id=Project.objects.get().id, part_id=part_obj.id
# )

# trainer = Setting.objects.first().get_trainer_obj()
# tags = trainer.get_tags(
# project_id=Project.objects.first().customvision_project_id
# )

# assert len(tags) == 1

# def test_upload_multi_parts():
# """
# Type:
# Positive

# Description:
# Upload single part to Custom Vision
# """
# for i in range(40):
# Part.objects.create(name=f"test_part_{i}")

# part_ids = [part.id for part in Part.objects.all()]
# Project.objects.get().create_project()
# batch_upload_parts_to_customvision(
# project_id=Project.objects.get().id, part_ids=part_ids
# )

# trainer = Setting.objects.first().get_trainer_obj()
# tags = trainer.get_tags(
# project_id=Project.objects.first().customvision_project_id
# )

# assert len(tags) == 40
