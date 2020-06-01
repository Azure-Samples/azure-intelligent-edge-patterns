from django.apps import AppConfig
import sys
from config import TRAINING_KEY, ENDPOINT
import logging

logger = logging.getLogger(__name__)


class CameraConfig(AppConfig):
    name = 'cameras'

    def ready(self):
        if 'runserver' in sys.argv:
            logger.info("CameraAppConfig ready while running server")
            DEFAULT_SETTING_NAME = 'DEFAULT_SETTING'

            from cameras.models import Setting

            existing_settings = Setting.objects.filter(
                name=DEFAULT_SETTING_NAME,
                training_key=TRAINING_KEY,
                endpoint=ENDPOINT)
            if len(existing_settings) == 1:
                logger.info(
                    f"Found existing {DEFAULT_SETTING_NAME}. Revalidating in pre_save...")
                setting = existing_settings[0]
                setting.save()
                return

            settings_with_dup_name = Setting.objects.filter(
                name=DEFAULT_SETTING_NAME)
            if len(settings_with_dup_name):
                logger.info(f"Deleting existing {DEFAULT_SETTING_NAME}")
                settings_with_dup_name.delete()

            settings_with_dup_ep_tk = Setting.objects.filter(
                endpoint=ENDPOINT, training_key=TRAINING_KEY)
            if len(settings_with_dup_ep_tk):
                logger.info(f"Deleting existing TRAINING_KEY+{ENDPOINT}")
                settings_with_dup_ep_tk.delete()

            logger.info(f"Creating new {DEFAULT_SETTING_NAME}")
            default_setting, created = Setting.objects.update_or_create(
                name=DEFAULT_SETTING_NAME,
                training_key=TRAINING_KEY,
                endpoint=ENDPOINT,
            )
            if created:
                logger.info(
                    f"{DEFAULT_SETTING_NAME} Created. Revalidating in pre_save...")
                default_setting.save()
            else:
                logger.error(
                    f"{DEFAULT_SETTING_NAME} not created. Something went wrong")
