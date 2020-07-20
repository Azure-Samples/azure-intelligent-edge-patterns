"""
Testing Signals
"""
import logging

from rest_framework.test import APITransactionTestCase

from configs.customvision_config import ENDPOINT, TRAINING_KEY

PROJECT_PREFIX = "UnitTest"

from vision_on_edge.azure_settings.models import Setting
from vision_on_edge.azure_training.models import Project
from vision_on_edge.azure_parts.models import Part
from ..models import Image

logger = logging.getLogger(__name__)


class ImageSignalsTestCase(APITransactionTestCase):
    """
    Testing image signals
    """

    def setUp(self):
        """
        Create setting, project and parts
        """
        Setting.objects.create(name="valid_setting",
                               endpoint=ENDPOINT,
                               training_key=TRAINING_KEY)

        Project.objects.create(
            setting=Setting.objects.first(),
            customvision_project_id='super_valid_project_id',
            customvision_project_name=f'{PROJECT_PREFIX}-test_create_1',
            is_demo=False)
        Part.objects.create(name="part_1",
                            description="description_1",
                            is_demo=False)

    def test_setup_is_valid(self):
        """test_delete_relable_if_acc_range_change.
        
        @Description:
        Make sure setup is valid
        """


    def test_delete_relable_if_acc_range_change(self):
        """test_delete_relable_if_acc_range_change.

        @Type
        Positive

        @Description:
        If Project relabel accuracy range change, delete all
        relabel image

        @Expected Results
        All relabel images deleted
        """

        for i in range(40):
            Image.objects.create(project=Project.objects.first(),
                                 part=Part.objects.first(),
                                 is_relabel=True)
        self.assertEqual(Image.objects.all().count(), 40)

        project_obj = Project.objects.first()
        project_obj.accuracyRangeMin = 80
        project_obj.accuracyRangeMax = 90
        project_obj.save()
        self.assertEqual(Image.objects.all().count(), 0)

    def test_delete_relable_if_acc_range_min_change(self):
        """test_delete_relable_if_acc_range_min_change.

        @Type
        Positive

        @Description:
        If Project relabel accuracyRangeMin change, delete all
        relabel image

        @Expected Results
        All relabel images deleted
        """
        for i in range(40):
            Image.objects.create(project=Project.objects.first(),
                                 part=Part.objects.first(),
                                 is_relabel=True)
        self.assertEqual(Image.objects.all().count(), 40)

        project_obj = Project.objects.first()
        project_obj.accuracyRangeMin += 1
        project_obj.save()
        self.assertEqual(Image.objects.all().count(), 0)

    def test_delete_relable_if_acc_range_max_change(self):
        """test_delete_relable_if_acc_range_max_change.

        @Type
        Positive

        @Description:
        If Project relabel accuracyRangeMax change, delete all
        relabel image

        @Expected Results
        All relabel images deleted
        """
        for i in range(40):
            Image.objects.create(project=Project.objects.first(),
                                 part=Part.objects.first(),
                                 is_relabel=True)
        self.assertEqual(Image.objects.all().count(), 40)

        project_obj = Project.objects.first()
        project_obj.accuracyRangeMax -=1
        project_obj.save()
        self.assertEqual(Image.objects.all().count(), 0)

    def test_not_delete_relable_if_acc_range_not_change(self):
        """test_not_delete_relable_if_acc_range_not_change.
        
        @Type
        Negative

        @Description:
        If Project relabel accuracy range not change, keep
        all relabel images

        @Expected Results
        All relabel images kept.
        """
        for i in range(40):
            Image.objects.create(project=Project.objects.first(),
                                 part=Part.objects.first(),
                                 is_relabel=True)
        self.assertEqual(Image.objects.all().count(), 40)

        project_obj = Project.objects.first()
        project_obj.is_demo = True
        project_obj.save()
        self.assertEqual(Image.objects.all().count(), 40)

    @classmethod
    def tearDownClass(cls):
        # trainer = CustomVisionTrainingClient(
        #     api_key=TRAINING_KEY, endpoint=ENDPOINT)
        # projects = trainer.get_projects()
        # for project in projects:
        #    if project.name.find(PROJECT_PREFIX) == 0:
        # trainer.delete_project(project_id=project.id)
        pass
