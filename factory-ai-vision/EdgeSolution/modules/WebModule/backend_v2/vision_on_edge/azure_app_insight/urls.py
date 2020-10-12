"""App urls.
"""

from django.urls import re_path

from .api.views import key_view

app_name = "app_insight"
urlpatterns = [re_path(r"^key/?$", view=key_view, name="key")]
