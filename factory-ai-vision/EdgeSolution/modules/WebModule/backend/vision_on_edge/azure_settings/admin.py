"""App admin.
"""

from django.contrib import admin

from .models import Setting

# register your models here.
admin.site.register(Setting)
