"""
Camera admin
"""
from django.contrib import admin
from .models import Project, Camera, Image, Part

# Register your models here.
admin.site.register(Project)
admin.site.register(Camera)
admin.site.register(Image)
admin.site.register(Part)
