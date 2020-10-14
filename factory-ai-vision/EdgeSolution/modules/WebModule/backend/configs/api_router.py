"""API router.
"""

from django.conf.urls import url
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework.routers import DefaultRouter

from vision_on_edge.azure_part_detections.api import views as part_detection_views
from vision_on_edge.azure_parts.api import views as azure_part_views
from vision_on_edge.azure_pd_deploy_status.api import views as azure_deploy_status_views
from vision_on_edge.azure_projects.api import views as azure_projects_views
from vision_on_edge.azure_settings.api import views as azure_setting_views
from vision_on_edge.azure_training_status.api import (
    views as azure_training_status_views,
)

# from vision_on_edge.cameras.api import util_views as camera_util_views
from vision_on_edge.cameras.api import views as camera_views
from vision_on_edge.feedback.api import views as feedback_views
from vision_on_edge.images.api import views as image_views
from vision_on_edge.inference_modules.api import views as inference_module_views
from vision_on_edge.locations.api import views as location_views
from vision_on_edge.notifications.api import views as notifications_views

# from vision_on_edge.relabeling.api import views as relabel_views
from vision_on_edge.streams.api import views as stream_views

# from vision_on_edge.image_predictions.api import \
# views as image_prediction_views

router = DefaultRouter()
router.trailing_slash = "/?"
app_name = "api"

router.register("settings", azure_setting_views.SettingViewSet)
router.register("projects", azure_projects_views.ProjectViewSet)
router.register("training_status", azure_training_status_views.TrainingStatusViewSet)
router.register("notifications", notifications_views.NotificationViewSet)
router.register("cameras", camera_views.CameraViewSet)
router.register("parts", azure_part_views.PartViewSet)
router.register("images", image_views.ImageViewSet)
router.register("locations", location_views.LocationViewSet)
router.register("inference_modules", inference_module_views.InferenceModuleViewSet)
router.register("part_detections", part_detection_views.PartDetectionViewSet)
router.register("part_detection_scenarios", part_detection_views.PDScenarioViewSet)
router.register("deploy_status", azure_deploy_status_views.DeployStatusViewSet)
# router.register('image_predictions',
# image_prediction_views.ImagePredictionViewSet)

# router.register('tasks', azure_projects_views.TaskViewSet)

router.register("feedback", feedback_views.FeedbackViewSet)

# router.register('images', image_views.ImageViewSet)

urlpatterns = router.urls

SchemaView = get_schema_view(
    openapi.Info(
        title="Factory AI API",
        default_version="v1",
        description="Factory AI",
        #        terms_of_service="https://www.google.com/policies/terms/",
        #        contact=openapi.Contact(email="contact@snippets.local"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns += [
    url(
        r"^swagger(?P<format>\.json|\.yaml)$",
        SchemaView.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    url(
        r"^swagger",
        SchemaView.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    url(
        r"^swagger/$",
        SchemaView.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    url(r"^redoc", SchemaView.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    url(r"^redoc/$", SchemaView.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
]

urlpatterns += [
    url("streams/connect", stream_views.connect_stream),
    path("streams/<int:stream_id>/disconnect", stream_views.disconnect_stream),
    path("streams/<int:stream_id>/video_feed", stream_views.video_feed),
    path("streams/<int:stream_id>/capture", stream_views.capture),
    path("streams/<int:stream_id>/keep_alive", stream_views.keep_alive),
    # path('relabel/update', relabel_views.relabel_update),
    path("appinsight/", include("vision_on_edge.azure_app_insight.urls")),
    # path('camera_utils/verify_rtsp', camera_util_views.verify_rtsp),
]
