from rest_framework import generics, permissions
from .models import Song
from .serializers import SongSerializer, SongUploadSerializer

# Admin uploads song
class SongUploadView(generics.CreateAPIView):
    queryset = Song.objects.all()
    serializer_class = SongUploadSerializer
    permission_classes = [permissions.IsAdminUser]


# List songs for users
class SongListView(generics.ListAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [permissions.AllowAny]


# Get single song + audio + lyrics
class SongDetailView(generics.RetrieveAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [permissions.AllowAny]


from rest_framework import generics, permissions
from .models import Recording
from .serializers import RecordingSerializer


class RecordingUploadView(generics.CreateAPIView):
    serializer_class = RecordingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MyRecordingsView(generics.ListAPIView):
    serializer_class = RecordingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Recording.objects.filter(user=self.request.user).order_by("-created_at")

