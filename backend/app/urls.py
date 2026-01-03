from django.urls import path
from .views import (
    SongUploadView,
    SongListView,
    SongDetailView,
    RecordingUploadView,
    MyRecordingsView,
    SecureMediaView,
)

urlpatterns = [
    # ───────────── Songs ─────────────
    path("songs/upload/", SongUploadView.as_view(), name="song-upload"),
    path("songs/", SongListView.as_view(), name="song-list"),
    path("songs/<int:pk>/", SongDetailView.as_view(), name="song-detail"),

    # ─────────── Recordings ───────────
    path("recordings/upload/", RecordingUploadView.as_view(), name="recording-upload"),
    path("recordings/", MyRecordingsView.as_view(), name="my-recordings"),

    # ─────────── Secure Media ─────────
    path("media/secure/", SecureMediaView.as_view(), name="secure-media"),
]
