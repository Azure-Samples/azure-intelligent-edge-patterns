"""vision_on_edge URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls import url, include
from django.conf.urls.static import static
from django.conf import settings

from rest_framework import routers

from cameras import views

router = routers.DefaultRouter()
router.register('api/cameras', views.CameraViewSet)
router.register('api/parts', views.PartViewSet)
router.register('api/images', views.ImageViewSet)
router.register('api/projects', views.ProjectViewSet)
router.register('api/locations', views.LocationViewSet)

urlpatterns = [
    url('^', include(router.urls)),
    url('api/streams/connect', views.connect_stream),
    path('api/streams/<int:stream_id>/disconnect', views.disconnect_stream),
    path('api/streams/<int:stream_id>/video_feed', views.video_feed),
    path('api/streams/<int:stream_id>/capture', views.capture),
    path('admin/', admin.site.urls),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
