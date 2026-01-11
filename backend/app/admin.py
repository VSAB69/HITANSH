from django.contrib import admin

from .models import (
    Song,
    Artist,
    Recording,
    SongLyricLine,
)

from .admin_utils import (
    signed_image_preview,
    signed_audio_preview,
    signed_file_link,
)

from .utils.lrc_parser import parse_lrc


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

    # ──────────────── PREVIEWS ────────────────

    def cover_preview(self, obj):
        return signed_image_preview(obj.cover_image)

    cover_preview.short_description = "Cover Preview"

    def audio_preview(self, obj):
        return signed_audio_preview(obj.audio_file)

    audio_preview.short_description = "Audio Preview"

    def lrc_preview(self, obj):
        return signed_file_link(obj.lrc_file, label="View LRC")

    lrc_preview.short_description = "Lyrics (.lrc)"

    # ──────────────── SAVE HOOK ────────────────

    def save_model(self, request, obj, form, change):
        """
        Save Song AND parse LRC lyrics into SongLyricLine
        """
        super().save_model(request, obj, form, change)

        if not obj.lrc_file:
            return

        # Remove old lyrics safely
        SongLyricLine.objects.filter(song=obj).delete()

        try:
            lrc_text = obj.lrc_file.read().decode("utf-8")
            obj.lrc_file.seek(0)
        except Exception:
            return

        parsed_lines = parse_lrc(lrc_text)

        SongLyricLine.objects.bulk_create([
            SongLyricLine(
                song=obj,
                timestamp=line["timestamp"],
                text=line["text"],
            )
            for line in parsed_lines
        ])


# ─────────────────────────────────────────────
# Lyrics (READ-ONLY, DEBUG FRIENDLY)
# ─────────────────────────────────────────────

@admin.register(SongLyricLine)
class SongLyricLineAdmin(admin.ModelAdmin):
    list_display = (
        "song",
        "timestamp",
        "text",
    )

    list_filter = ("song",)
    search_fields = ("text",)
    ordering = ("song", "timestamp")

    readonly_fields = (
        "song",
        "timestamp",
        "text",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


# ─────────────────────────────────────────────
# Recording
# ─────────────────────────────────────────────

@admin.register(Recording)
class RecordingAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "song",
        "created_at",
        "duration",
        "audio_preview",
    )

    readonly_fields = (
        "audio_preview",
        "created_at",
    )

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