
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from app.views_media import MediaStreamView
from django.urls import re_path

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", include("app.urls")),
    path('auth/', include('base.urls')),
]

urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", MediaStreamView.as_view()),
]