from django.urls import path
from .views import *

urlpatterns = [
    path("songs/upload/", SongUploadView.as_view(), name="song-upload"),
    path("songs/", SongListView.as_view(), name="song-list"),
    path("songs/<int:pk>/", SongDetailView.as_view(), name="song-detail"),
    path("recordings/", MyRecordingsView.as_view(), name="my-recordings"),
    path("recordings/upload/", RecordingUploadView.as_view(), name="recording-upload"),
    

]
