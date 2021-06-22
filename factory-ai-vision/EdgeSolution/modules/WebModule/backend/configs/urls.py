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
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from rest_framework import routers

from vision_on_edge.azure_settings.api import views as setting_views
from vision_on_edge.azure_training.api import views as azure_training_views
from vision_on_edge.cameras.api import util_views as camera_util_views
from vision_on_edge.cameras.api import views
from vision_on_edge.image_predictions.api import \
    views as image_prediction_views
from vision_on_edge.locations.api import views as location_views

from . import views as site_views


class OptionalSlashRouter(routers.DefaultRouter):
    """Make slash ('/') in url to be optional"""

    def __init__(self):
        super().__init__()
        self.trailing_slash = '/?'


#router = ters.DefaultRouter(trailing_slash=False)
router = OptionalSlashRouter()
router.register('settings', setting_views.SettingViewSet)
router.register('cameras', views.CameraViewSet)
router.register('parts', views.PartViewSet)
router.register('images', views.ImageViewSet)
router.register('locations', location_views.LocationViewSet)
router.register('annotations', views.AnnotationViewSet)
router.register('image_predictions',
                image_prediction_views.ImagePredictionViewSet)
router.register('projects', azure_training_views.ProjectViewSet)
router.register('train', azure_training_views.TrainViewSet)
router.register('tasks', azure_training_views.TaskViewSet)

urlpatterns = \
    static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + \
    static(settings.ICON_URL, document_root=settings.ICON_ROOT) + \
    [
        url('^api/', include(router.urls)),
        url('api/streams/connect', views.connect_stream),
        path('api/streams/<int:stream_id>/disconnect', views.disconnect_stream),
        path('api/streams/<int:stream_id>/video_feed', views.video_feed),
        path('api/streams/<int:stream_id>/capture', views.capture),
        path('api/projects/<int:project_id>/train', azure_training_views.train),
        path('api/projects/<int:project_id>/export',
             azure_training_views.export),
        path('api/projects/<int:project_id>/train_performance',
             azure_training_views.train_performance),
        path('api/projects/<int:project_id>/inference_video_feed',
             views.inference_video_feed),
        path('api/projects/<int:project_id>/pull_cv_project',
             azure_training_views.pull_cv_project),
        path('api/projects/<int:project_id>/update_prob_threshold',
             azure_training_views.update_prob_threshold),
        path('api/projects/<int:project_id>/reset_project',
             azure_training_views.reset_project),
        path('api/projects/<int:project_id>/reset_camera',
             azure_training_views.project_reset_camera),
        path('api/projects/null/export', azure_training_views.export_null),
        path('api/relabel', views.upload_relabel_image),
        path('api/relabel/update', views.relabel_update),
        path('api/appinsight/key', views.instrumentation_key),
        path('api/camera_utils/verify_rtsp',
             camera_util_views.verify_rtsp),
        path('admin/', admin.site.urls),
        url('^', site_views.UIAppView.as_view())
    ]
