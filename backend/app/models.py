from django.db import models
from base.models import User   # adjust import based on your structure

class Artist(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Song(models.Model):
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.SET_NULL, null=True, blank = True)
    language = models.CharField(max_length=100)
    genre = models.CharField(max_length=100, blank = True)
    cover_image = models.ImageField(upload_to="song_covers/")
    audio_file = models.FileField(upload_to="songs/audio/")
    lrc_file = models.FileField(upload_to="songs/lyrics/")
    duration = models.PositiveIntegerField(help_text="Duration in seconds")

    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL,
                                    null=True, related_name="uploaded_songs")

    def __str__(self):
        return self.title


class SongLyricLine(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name="lyrics")
    timestamp = models.FloatField(help_text="Seconds since start of song")
    text = models.CharField(max_length=500)

    def __str__(self):
        return f"[{self.timestamp}] {self.text}"
    


from django.db import models
from django.conf import settings
from pydub import AudioSegment
from django.db import models
from django.conf import settings
from pydub import AudioSegment
from tempfile import NamedTemporaryFile

import os
import tempfile
from django.db import models
from django.conf import settings
from pydub import AudioSegment


class Recording(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recordings"
    )
    song = models.ForeignKey(
        "Song",
        on_delete=models.CASCADE,
        related_name="recordings"
    )
    audio_file = models.FileField(upload_to="recordings/")
    duration = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Calculate duration BEFORE saving
        if self.audio_file and not self.duration:
            # Create temp file safely on Windows
            with tempfile.NamedTemporaryFile(
                suffix=".webm",
                delete=False
            ) as tmp:
                for chunk in self.audio_file.chunks():
                    tmp.write(chunk)
                tmp_path = tmp.name

            try:
                audio = AudioSegment.from_file(tmp_path)
                self.duration = round(len(audio) / 1000, 2)
            finally:
                # Always delete temp file
                os.remove(tmp_path)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user} - {self.song.title}"
