from django.test import TestCase

# Create your tests here.

from django.test import TestCase
from cameras.models import Trainer
from config import ENDPOINT, TRAINING_KEY


class TrainerTestCase(TestCase):
    def setUp(self):
        """
        Create serveral trainer
        :DEFAULT_TRAINER: trainer create from configs
        :INVALID_TRAINER: an invalid trainer
        """
        Trainer.objects.create(trainer_name="DEFAULT_TRAINER",
                               end_point=ENDPOINT,
                               training_key=TRAINING_KEY,
                               is_trainer_valid=False)

        Trainer.objects.create(trainer_name="INVALID_TRAINER",
                               end_point=ENDPOINT,
                               training_key='5566cannotdie',
                               is_trainer_valid=True)

    def test_persave_trainer_is_valid(self):
        """
        Trainer pre_save should validate the ENDPOINT and TRAINING KEY and save in 'is_trainer_valid'
        """
        default_trainer = Trainer.objects.get(trainer_name="DEFAULT_TRAINER")
        invalid_trainer = Trainer.objects.get(trainer_name="INVALID_TRAINER")
        self.assertTrue(default_trainer.is_trainer_valid)
        self.assertFalse(invalid_trainer.is_trainer_valid)

    def test_revalidate(self):
        """
        revalidate should update 
        """
        default_trainer = Trainer.objects.get(trainer_name="DEFAULT_TRAINER")
        invalid_trainer = Trainer.objects.get(trainer_name="INVALID_TRAINER")
        self.assertTrue(default_trainer.revalidate())
        self.assertFalse(invalid_trainer.revalidate())

    def test_revalidate_and_get_trainer_obj(self):
        """
        revalidate should update 
        """
        from azure.cognitiveservices.vision.customvision.training import CustomVisionTrainingClient
        default_trainer = Trainer.objects.get(trainer_name="DEFAULT_TRAINER")
        invalid_trainer = Trainer.objects.get(trainer_name="INVALID_TRAINER")
        self.assertIsInstance(
            default_trainer.revalidate_and_get_trainer_obj(), CustomVisionTrainingClient)
        self.assertIsNone(invalid_trainer.revalidate_and_get_trainer_obj())

    def test_create_project(self):
        from azure.cognitiveservices.vision.customvision.training.models import Project
        default_trainer = Trainer.objects.get(trainer_name="DEFAULT_TRAINER")
        invalid_trainer = Trainer.objects.get(trainer_name="INVALID_TRAINER")
        project = default_trainer.create_project('django_unittest')
        self.assertIsInstance(project, Project)
