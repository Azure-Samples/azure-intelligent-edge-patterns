from django.apps import AppConfig
import sys
from config import TRAINING_KEY, ENDPOINT
import logging


class CameraConfig(AppConfig):
    name = 'cameras'

    def ready(self):
        print(sys.argv)
        if 'runserver' in sys.argv:
            logging.info("Cleaning Default Trainer")
            DEFAULT_TRAINER_NAME = 'DEFAULT_TRAINER'
            from cameras.models import Trainer

            trainers_with_dup_name = Trainer.objects.filter(
                trainer_name=DEFAULT_TRAINER_NAME)

            if len(trainers_with_dup_name):
                logging.info(f"Found existed {DEFAULT_TRAINER_NAME}")
                logging.info(trainers_with_dup_name)
                logging.info("Deleting")
                trainers_with_dup_name.delete()
            trainers_with_dup_ep_tk = Trainer.objects.filter(
                end_point=ENDPOINT, training_key=TRAINING_KEY)

            if len(trainers_with_dup_ep_tk):
                logging.info(f"Found existed TRAINING_KEY+{ENDPOINT}")
                logging.info(trainers_with_dup_ep_tk)
                logging.info("Deleting")
                trainers_with_dup_ep_tk.delete()
            logging.info("Creating Default Trainer")
            default_trainer, created = Trainer.objects.update_or_create(
                trainer_name=DEFAULT_TRAINER_NAME,
                training_key=TRAINING_KEY,
                end_point=ENDPOINT,
            )
            if created:
                default_trainer.revalidate()
        else:
            print("Escaping")
