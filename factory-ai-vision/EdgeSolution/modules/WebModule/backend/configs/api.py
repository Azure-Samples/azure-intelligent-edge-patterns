"""
API
"""
from rest_framework import routers

from app import views as app_views

router = routers.DefaultRouter()
router.register(r'cameras', app_views.CameraViewSets)
