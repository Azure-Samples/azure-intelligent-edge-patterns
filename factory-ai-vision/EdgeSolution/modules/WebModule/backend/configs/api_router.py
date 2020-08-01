"""API router
"""

from django.conf import settings
from django.conf.urls import url
from django.urls import path
from rest_framework.routers import DefaultRouter, SimpleRouter

from vision_on_edge.azure_app_insight.api import views as app_insight_views
from vision_on_edge.azure_parts.api import views as azure_part_views
from vision_on_edge.azure_settings.api import views as azure_setting_views
from vision_on_edge.azure_training.api import views as azure_training_views
from vision_on_edge.azure_training_status.api import \
    views as azure_training_status_views
from vision_on_edge.cameras.api import util_views as camera_util_views
from vision_on_edge.cameras.api import views
from vision_on_edge.feedback.api import views as feedback_views
from vision_on_edge.image_predictions.api import \
    views as image_prediction_views
from vision_on_edge.images.api import views as image_views
from vision_on_edge.locations.api import views as location_views
from vision_on_edge.notifications.api import views as notifications_views
from vision_on_edge.relabeling.api import views as relabel_views
from vision_on_edge.streams.api import views as stream_views

router = DefaultRouter()

router.register('settings', azure_setting_views.SettingViewSet)
router.register('cameras', views.CameraViewSet)
router.register('parts', azure_part_views.PartViewSet)
router.register('locations', location_views.LocationViewSet)
router.register('image_predictions',
                image_prediction_views.ImagePredictionViewSet)
router.register('projects', azure_training_views.ProjectViewSet)
router.register('training_status',
                azure_training_status_views.TrainingStatusViewSet)
router.register('tasks', azure_training_views.TaskViewSet)
router.register('images', image_views.ImageViewSet)
router.register('feedback', feedback_views.FeedbackViewSet)
router.register('notifications', notifications_views.NotificationViewSet)
router.register('images', image_views.ImageViewSet)

urlpatterns = router.urls

# urlpatterns += [
    # url('streams/connect', stream_views.connect_stream),
    # path('streams/<int:stream_id>/disconnect', stream_views.disconnect_stream),
    # path('streams/<int:stream_id>/video_feed', stream_views.video_feed),
    # path('streams/<int:stream_id>/capture', stream_views.capture),
    # path('streams/<int:stream_id>/keep_alive', stream_views.keep_alive),
    # path('projects/<int:project_id>/train', azure_training_views.train),
    # path('projects/<int:project_id>/export', azure_training_views.export),
    # path('projects/<int:project_id>/train_performance',
         # azure_training_views.train_performance),
    # path('projects/<int:project_id>/inference_video_feed',
         # stream_views.inference_video_feed),
    # path('projects/<int:project_id>/pull_cv_project',
         # azure_training_views.pull_cv_project),
    # path('projects/<int:project_id>/update_prob_threshold',
         # azure_training_views.update_prob_threshold),
    # path('projects/<int:project_id>/reset_project',
         # azure_training_views.reset_project),
    # path('projects/<int:project_id>/reset_camera',
         # azure_training_views.project_reset_camera),
    # path('projects/null/export', azure_training_views.export_null),
    # path('relabel', relabel_views.upload_relabel_image),
    # path('relabel/update', relabel_views.relabel_update),
    # path('appinsight/key', app_insight_views.instrumentation_key),
    # path('camera_utils/verify_rtsp', camera_util_views.verify_rtsp)
# ]

app_name = "api"
