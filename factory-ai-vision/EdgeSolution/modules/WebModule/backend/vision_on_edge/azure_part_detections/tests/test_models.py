"""App model tests.
"""

import pytest

from ...azure_parts.models import Part
from ..exceptions import (
    PdDeployWithoutCameras,
    PdDeployWithoutInferenceModule,
    PdDeployWithoutProject,
)
from .factories import PartDetectionFactory

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize(
    "has_cam, has_project, has_inf, output",
    [
        [x, y, z, (x and y and z)]
        for x in [True, False]
        for y in [True, False]
        for z in [True, False]
    ],
)
def test_pd_is_deployable(
    camera, demo_project, inference_module, has_cam, has_project, has_inf, output
):

    part_detection = PartDetectionFactory()
    if has_cam:
        part_detection.cameras.set([camera])
    else:
        part_detection.cameras.set([])
    part_detection.project = demo_project if has_project else None
    part_detection.inference_module = inference_module if has_inf else None
    assert part_detection.is_deployable() == output


@pytest.mark.parametrize(
    "has_cam, has_project, has_inf, error",
    [
        [False, True, True, PdDeployWithoutCameras],
        [True, False, True, PdDeployWithoutProject],
        [True, True, False, PdDeployWithoutInferenceModule],
    ],
)
def test_pd_is_deployable_error(
    camera, demo_project, inference_module, has_cam, has_project, has_inf, error
):

    part_detection = PartDetectionFactory()
    if has_cam:
        part_detection.cameras.set([camera])
    else:
        part_detection.cameras.set([])
    part_detection.project = demo_project if has_project else None
    part_detection.inference_module = inference_module if has_inf else None
    with pytest.raises(error):
        assert part_detection.is_deployable(raise_exception=True)


@pytest.mark.parametrize(
    "has_part, has_imgs_remote, has_imgs_local, output",
    [
        [x, y, z, x and (y or z)]
        for x in [True, False]
        for y in [True, False]
        for z in [True, False]
    ],
)
def test_pd_is_deployable_error_2(
    camera, part, has_part, has_imgs_remote, has_imgs_local, output, monkeypatch
):

    part_detection = PartDetectionFactory()
    part_detection.cameras.set([camera])
    if has_part:
        part_detection.parts.set([part])
        part.project = part_detection.project
        part.save()

    def mocked_img_count(*args, **kwargs):
        return 100

    if has_imgs_remote:
        monkeypatch.setattr(Part, "get_tagged_images_count_remote", mocked_img_count)
    if has_imgs_local:
        monkeypatch.setattr(Part, "get_tagged_images_count_local", mocked_img_count)
    assert part_detection.is_deployable() == output
