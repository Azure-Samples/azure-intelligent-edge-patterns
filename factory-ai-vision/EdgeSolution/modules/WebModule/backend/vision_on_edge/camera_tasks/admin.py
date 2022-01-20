"""App admin.
"""

from django.contrib import admin

from .models import CameraTask

# Register your models here.
admin.site.register(CameraTask)
