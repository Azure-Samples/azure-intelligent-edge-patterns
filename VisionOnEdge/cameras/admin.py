from django.contrib import admin
from .models import Project, Location, Camera, Image, Part

# Register your models here.
admin.site.register(Project)
admin.site.register(Location)
admin.site.register(Camera)
admin.site.register(Image)
admin.site.register(Part)

