"""App admin.
"""

from django.contrib import admin

from .models import DeployStatus

# Register your models here.
admin.site.register(DeployStatus)
