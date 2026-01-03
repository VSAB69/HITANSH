from django.contrib import admin
from .models import Song, Artist, Recording
from .admin_utils import (
    signed_image_preview,
    signed_audio_preview,
    signed_file_link,
)

# ─────────────────────────────────────────────
# Artist
# ─────────────────────────────────────────────

@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    search_fields = ("name",)


# ─────────────────────────────────────────────
# Song
# ─────────────────────────────────────────────

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "artist",
        "language",
        "cover_preview",
        "audio_preview",
        "duration",
    )

    readonly_fields = (
        "cover_preview",
        "audio_preview",
        "lrc_preview",
    )

    fields = (
        "title",
        "artist",
        "language",
        "genre",
        "duration",
        "cover_image",
        "cover_preview",
        "audio_file",
        "audio_preview",
        "lrc_file",
        "lrc_preview",
    )

    def cover_preview(self, obj):
        return signed_image_preview(obj.cover_image)

    cover_preview.short_description = "Cover"

    def audio_preview(self, obj):
        return signed_audio_preview(obj.audio_file)

    audio_preview.short_description = "Audio"

    def lrc_preview(self, obj):
        return signed_file_link(obj.lrc_file, label="View Lyrics")

    lrc_preview.short_description = "Lyrics (.lrc)"


@admin.register(Recording)
class RecordingAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "song",
        "created_at",
        "duration",
        "audio_preview",
    )

    readonly_fields = ("audio_preview",)

    fields = (
        "user",
        "song",
        "duration",
        "audio_file",
        "audio_preview",
        "created_at",
    )

    def audio_preview(self, obj):
        return signed_audio_preview(obj.audio_file)

    audio_preview.short_description = "Recording Preview"
