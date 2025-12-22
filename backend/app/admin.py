from django.contrib import admin
from .models import *


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


class SongLyricLineInline(admin.TabularInline):
    model = SongLyricLine
    extra = 0
    readonly_fields = ("timestamp", "text")
    can_delete = False

from django.contrib import admin
from .models import Song, Artist, SongLyricLine
from app.utils.lrc_parser import parse_lrc



@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "artist", "genre", "language", "duration")
    readonly_fields = ("uploaded_by",)

    def save_model(self, request, obj, form, change):
        """
        Called when saving via admin panel.
        We must parse the LRC file here because DRF serializer is NOT used.
        """
        is_new = obj.pk is None  # Detect new uploads

        super().save_model(request, obj, form, change)

        # Assign uploader
        if is_new:
            obj.uploaded_by = request.user
            obj.save()

        # PARSE LRC ONLY IF FILE WAS UPLOADED OR CHANGED
        if "lrc_file" in form.changed_data:
            # Remove old lyrics
            SongLyricLine.objects.filter(song=obj).delete()

            if obj.lrc_file:
                lrc_text = obj.lrc_file.read().decode("utf-8-sig")
                parsed = parse_lrc(lrc_text)

                bulk_list = [
                    SongLyricLine(song=obj, timestamp=line["timestamp"], text=line["text"])
                    for line in parsed
                ]
                SongLyricLine.objects.bulk_create(bulk_list)



@admin.register(SongLyricLine)
class SongLyricLineAdmin(admin.ModelAdmin):
    list_display = ("id", "song", "timestamp", "text")
    list_filter = ("song",)
    search_fields = ("text", "song__title")



from django.contrib import admin
from .models import Recording


@admin.register(Recording)
class RecordingAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "song", "created_at")
    list_filter = ("song", "created_at")
    search_fields = ("user__username", "song__title")
