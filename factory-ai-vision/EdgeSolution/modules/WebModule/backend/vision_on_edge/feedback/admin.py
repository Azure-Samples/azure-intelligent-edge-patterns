"""App admin.
"""

from django.contrib import admin

from .models import Feedback

# Register your models here.
admin.site.register(Feedback)
