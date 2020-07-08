"""
Setting Model Test.
In this test, projects will be created on Azure Custom Vision.

Requirements:
1. ENDPOINT, TRAINING_KEY in config.py is valid.
2. Custom Vision is able to create projects

Notes:
1. All test projects created on Azure Custom Vision will/should use name
   started with PROJECT_PREFIX.
2. All projects on Azure Custom Vision started with PROJECT_PREFIX will be
   deleted after testing.
"""
import logging

from azure.cognitiveservices.vision.customvision.training import \
    CustomVisionTrainingClient
from azure.cognitiveservices.vision.customvision.training.models import Project
from rest_framework.test import APITransactionTestCase

from configs.customvision_config import ENDPOINT, TRAINING_KEY

from ..models import Setting

PROJECT_PREFIX = "UnitTest"

logger = logging.getLogger(__name__)


class SettingTestCase(APITransactionTestCase):
    """
    Model Setting test cases
    """

    def setUp(self):
        """
        Create serveral trainer
        :DEFAULT_TRAINER: trainer create from configs
        :INVALID_TRAINER: an invalid trainer
        """
        Setting.objects.create(name="DEFAULT_SETTING",
                               endpoint=ENDPOINT,
                               training_key=TRAINING_KEY,
                               is_trainer_valid=False)

        Setting.objects.create(name="INVALID_SETTING",
                               endpoint=ENDPOINT,
                               training_key='5566cannotdie',
                               is_trainer_valid=True)

    def test_setup_is_valid(self):
        """
        @Type
        Positive

        @Description
        Setting pre_save should validate the (ENDPOINT, TRAINING_KEY)
        'is_trainer_valid' should be updated.

        @Expectd result
        is_trainer_valid reflect validity of Training Key and Endpoint.
        """
        default_setting = Setting.objects.get(name="DEFAULT_SETTING")
        invalid_setting = Setting.objects.get(name="INVALID_SETTING")
        self.assertTrue(default_setting.is_trainer_valid)
        self.assertFalse(invalid_setting.is_trainer_valid)

    def test_presave_validate(self):
        """
        @Type
        Positvie

        @Description
        pre_save should validate ENDPOINT and TRAINING_KEY and update
        'is_trainer_valid'.

        @Expected Result
        is_trainer_valid updated.
        """
        default_setting = Setting.objects.get(name="DEFAULT_SETTING")
        self.assertTrue(default_setting.is_trainer_valid)
        default_setting.training_key = "INVALID_TRAINING_KEY"
        default_setting.save()
        self.assertFalse(default_setting.is_trainer_valid)

        invalid_setting = Setting.objects.get(name="INVALID_SETTING")
        self.assertFalse(invalid_setting.is_trainer_valid)
        invalid_setting.training_key = TRAINING_KEY
        invalid_setting.save()
        self.assertTrue(invalid_setting.is_trainer_valid)

    def test_revalidate_and_get_setting_obj(self):
        """
        @Type
        Positvie

        @Description
        pre_save should validate ENDPOINT and TRAINING_KEY and update
        'is_trainer_valid'.

        @Expected Result
        is_trainer_valid updated.
        """
        default_setting = Setting.objects.get(name="DEFAULT_SETTING")
        invalid_setting = Setting.objects.get(name="INVALID_SETTING")
        self.assertIsInstance(default_setting.revalidate_and_get_trainer_obj(),
                              CustomVisionTrainingClient)
        self.assertIsNone(invalid_setting.revalidate_and_get_trainer_obj())

    def test_create_project_positive(self):
        """
        @Type
        Positive

        @Description
        METHOD Setting.create_project will create a project
        on custom vision and return the project objects.

        @Expected Results
        project_created if setting is valid
        """
        valid_setting = Setting.objects.get(name="DEFAULT_SETTING")

        project = valid_setting.create_project(
            f"{PROJECT_PREFIX}-django_unittest")

        self.assertIsInstance(project, Project)
        valid_setting.get_trainer_obj().get_project(project.id)

    def test_create_project_negative(self):
        """
        @Type
        Positive

        @Description
        METHOD Setting.create_project will create a project
        on custom vision and return the project objects.

        @Expected Results
        exception raise if setting is invalid
        """
        invalid_setting = Setting.objects.get(name="INVALID_SETTING")

        project = invalid_setting.create_project(
            f"{PROJECT_PREFIX}-django_unittest")

        # NA
        self.assertIsNone(project)

    @classmethod
    def tearDownClass(cls):
        logger.info("Deleting Projects on CustomVision")
        trainer = CustomVisionTrainingClient(api_key=TRAINING_KEY,
                                             endpoint=ENDPOINT)
        projects = trainer.get_projects()
        for project in projects:
            if project.name.find(PROJECT_PREFIX) == 0:
                trainer.delete_project(project_id=project.id)
