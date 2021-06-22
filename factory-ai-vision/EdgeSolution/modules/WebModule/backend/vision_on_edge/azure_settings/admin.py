"""
Setting admin
"""
from django.contrib import admin

from .models import Setting

# Register your models here.
admin.site.register(Setting)
