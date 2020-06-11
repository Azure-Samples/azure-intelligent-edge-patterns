from django.test import TransactionTestCase
from cameras.models import Project
from django.db.utils import IntegrityError
from sqlite3 import IntegrityError as dbIntegrityError
from config import ENDPOINT, TRAINING_KEY


class ModelProjectTestCase(TransactionTestCase):
    def setUp(self):
        """
        Create serveral Location
        :DEFAULT_TRAINER: trainer create from configs
        :INVALID_TRAINER: an invalid trainer
        """
        Setting.objects.create(name="DEFAULT_SETTING",
                               endpoint=ENDPOINT,
                               training_key=TRAINING_KEY,
                               is_trainer_valid=False)
        project_1, created = Project.objects.create(
            is_demo=False,
            defaults={'setting': default_setting,
                      'camera': demo_camera,
                      'location': demo_location, })
        demo_project_1, created = Project.objects.update_or_create(
            is_demo=True,
            defaults={'setting': default_setting,
                      'camera': demo_camera,
                      'location': demo_location, })
