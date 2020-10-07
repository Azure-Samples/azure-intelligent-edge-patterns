"""App admin.
"""

from django.contrib import admin

from .models import InferenceModule

# Register your models here.
admin.site.register(InferenceModule)
