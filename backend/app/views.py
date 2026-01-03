from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Song, Recording
from .serializers import *

from .utils.r2 import generate_signed_url


# ─────────────────────────────────────────────
# SONG VIEWS
# ─────────────────────────────────────────────

# Admin-only song upload
class SongUploadView(generics.CreateAPIView):
    queryset = Song.objects.all()
    serializer_class = SongUploadSerializer
    permission_classes = [permissions.IsAdminUser]


# List all songs (AUTH REQUIRED)
class SongListView(generics.ListAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticated]


# Song detail (AUTH REQUIRED)
class SongDetailView(generics.RetrieveAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─────────────────────────────────────────────
# RECORDING VIEWS
# ─────────────────────────────────────────────

# Upload recording (AUTH REQUIRED)
class RecordingUploadView(generics.CreateAPIView):
    serializer_class = RecordingUploadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# List logged-in user's recordings
class MyRecordingsView(generics.ListAPIView):
    serializer_class = RecordingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Recording.objects
            .filter(user=self.request.user)
            .select_related("song")
            .order_by("-created_at")
        )


# ─────────────────────────────────────────────
# SECURE MEDIA GATEWAY (R2 SIGNED URL)
# ─────────────────────────────────────────────

class SecureMediaView(APIView):
    """
    The ONLY way media is accessed.
    - Requires JWT
    - Validates access
    - Generates short-lived signed URL
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        key = request.query_params.get("key")
        if not key:
            return Response({"error": "Missing key"}, status=400)

        user = request.user

        # ───── ACCESS CONTROL (ANTI-IDOR) ─────
        allowed = (
            # Songs (shared across authenticated users)
            Song.objects.filter(audio_file=key).exists()
            or Song.objects.filter(cover_image=key).exists()
            or Song.objects.filter(lrc_file=key).exists()

            # Recordings (PRIVATE per user)
            or Recording.objects.filter(audio_file=key, user=user).exists()
        )

        if not allowed:
            return Response({"error": "Forbidden"}, status=403)

        # Generate short-lived signed URL
        signed_url = generate_signed_url(key=key, expires=300)

        return Response({
    "url": signed_url,
    "expires_in": 300
})



class SongListView(generics.ListAPIView):
    queryset = Song.objects.select_related("artist")
    serializer_class = SongListSerializer
    permission_classes = [permissions.IsAuthenticated]
