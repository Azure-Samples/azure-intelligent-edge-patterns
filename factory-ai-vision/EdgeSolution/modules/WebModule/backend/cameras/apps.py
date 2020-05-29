from django.apps import AppConfig
import sys
from config import TRAINING_KEY, ENDPOINT
import logging

logger = logging.getLogger(__name__)


class CameraConfig(AppConfig):
    name = 'cameras'

    def ready(self):
        if 'runserver' in sys.argv:
            logger.info("CemeraAppConfig ready while running server")
            DEFAULT_TRAINER_NAME = 'DEFAULT_TRAINER'

            from cameras.models import Trainer

            existing_trainers = Trainer.objects.filter(
                trainer_name=DEFAULT_TRAINER_NAME,
                training_key=TRAINING_KEY,
                end_point=ENDPOINT)
            if len(existing_trainers) == 1:
                logger.info(
                    f"Found existing {DEFAULT_TRAINER_NAME}. Revalidating...")
                trainer = existing_trainers[0]
                trainer.revalidate()
                return

            trainers_with_dup_name = Trainer.objects.filter(
                trainer_name=DEFAULT_TRAINER_NAME)
            if len(trainers_with_dup_name):
                logger.info(f"Deleting existing {DEFAULT_TRAINER_NAME}")
                trainers_with_dup_name.delete()

            trainers_with_dup_ep_tk = Trainer.objects.filter(
                end_point=ENDPOINT, training_key=TRAINING_KEY)
            if len(trainers_with_dup_ep_tk):
                logger.info(f"Deleting existing TRAINING_KEY+{ENDPOINT}")
                trainers_with_dup_ep_tk.delete()

            logger.info(f"Creating new {DEFAULT_TRAINER_NAME}")
            default_trainer, created = Trainer.objects.update_or_create(
                trainer_name=DEFAULT_TRAINER_NAME,
                training_key=TRAINING_KEY,
                end_point=ENDPOINT,
            )
            if created:
                logger.info(f"{DEFAULT_TRAINER_NAME} Created")
                default_trainer.revalidate()
