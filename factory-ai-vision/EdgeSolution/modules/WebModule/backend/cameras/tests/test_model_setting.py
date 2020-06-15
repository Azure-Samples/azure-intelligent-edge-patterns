from rest_framework.test import APITransactionTestCase
from cameras.models import Setting
from config import ENDPOINT, TRAINING_KEY

# You should have valid training key and endpoint in order to test this module


class SettingTestCase(APITransactionTestCase):
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
        Setting pre_save should validate the (ENDPOINT, TRAINING_KEY) and save in 'is_trainer_valid'
        """
        default_setting = Setting.objects.get(name="DEFAULT_SETTING")
        invalid_setting = Setting.objects.get(name="INVALID_SETTING")
        self.assertTrue(default_setting.is_trainer_valid)
        self.assertFalse(invalid_setting.is_trainer_valid)

    def test_presave_validate(self):
        """
        Setting pre_save should validate the (ENDPOINT, TRAINING_KEY) and save in 'is_trainer_valid'
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
        revalidate should update 
        """
        from azure.cognitiveservices.vision.customvision.training import CustomVisionTrainingClient
        default_setting = Setting.objects.get(name="DEFAULT_SETTING")
        invalid_setting = Setting.objects.get(name="INVALID_SETTING")
        self.assertIsInstance(
            default_setting.revalidate_and_get_trainer_obj(),
            CustomVisionTrainingClient)
        self.assertIsNone(
            invalid_setting.revalidate_and_get_trainer_obj())

    def test_create_project(self):
        from azure.cognitiveservices.vision.customvision.training.models import Project
        from azure.cognitiveservices.vision.customvision.training.models import CustomVisionErrorException

        default_setting = Setting.objects.get(name="DEFAULT_SETTING")
        default_trainer = default_setting._get_trainer_obj()
        invalid_setting = Setting.objects.get(name="INVALID_SETTING")

        project = default_setting.create_project('django_unittest')
        project_na = invalid_setting.create_project('django_unittest')

        # Valid Project
        self.assertIsInstance(project, Project)
        self.assertIsInstance(default_trainer.get_project(project.id), Project)
        default_setting._get_trainer_obj().delete_project(project_id=project.id)

        # NA
        self.assertIsNone(project_na)
