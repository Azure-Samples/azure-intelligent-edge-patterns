"""
Camera admin
"""
from django.contrib import admin

from .models import Camera, Image, Part

# Register your models here.
admin.site.register(Camera)
admin.site.register(Image)
admin.site.register(Part)
