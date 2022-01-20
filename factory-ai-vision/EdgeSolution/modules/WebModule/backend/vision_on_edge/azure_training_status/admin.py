"""App admin.
"""

from django.contrib import admin

from .models import TrainingStatus

# Register your models here.
admin.site.register(TrainingStatus)
