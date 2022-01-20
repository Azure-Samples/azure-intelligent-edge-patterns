"""App admin.
"""
from django.contrib import admin

from .models import Camera

# Register your models here.
admin.site.register(Camera)
