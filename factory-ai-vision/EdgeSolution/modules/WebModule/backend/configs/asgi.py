"""Project ASGI configs.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vision_on_edge.settings")
if os.environ.get("DJANGO_ENV") == "production":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "configs.settings.production")
else:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "configs.settings.local")

application = get_asgi_application()
