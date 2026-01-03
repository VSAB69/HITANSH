from rest_framework import serializers
from .models import Song, SongLyricLine, Artist, Recording


# ─────────────────────────────────────────────
# Artist
# ─────────────────────────────────────────────

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ["id", "name"]


# ─────────────────────────────────────────────
# Song Lyrics Lines
# ─────────────────────────────────────────────

class SongLyricLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongLyricLine
        fields = ["timestamp", "text"]


# ─────────────────────────────────────────────
# Song (READ – SECURE)
# ─────────────────────────────────────────────

class SongSerializer(serializers.ModelSerializer):
    lyrics = SongLyricLineSerializer(many=True, read_only=True)
    artist = ArtistSerializer(read_only=True)

    cover_key = serializers.SerializerMethodField()
    audio_key = serializers.SerializerMethodField()
    lrc_key = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = [
            "id",
            "title",
            "artist",
            "language",
            "genre",
            "duration",
            "cover_key",
            "audio_key",
            "lrc_key",
            "lyrics",
        ]

    def get_cover_key(self, obj):
        return obj.cover_image.name if obj.cover_image else None

    def get_audio_key(self, obj):
        return obj.audio_file.name if obj.audio_file else None

    def get_lrc_key(self, obj):
        return obj.lrc_file.name if obj.lrc_file else None


# ─────────────────────────────────────────────
# Song (UPLOAD)
# ─────────────────────────────────────────────

class SongUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = [
            "title",
            "artist",
            "language",
            "genre",
            "cover_image",
            "audio_file",
            "lrc_file",
            "duration",
        ]

    def create(self, validated_data):
        from .utils import parse_lrc
        from .models import SongLyricLine

        lrc_file = validated_data.get("lrc_file")

        # Save song first (uploads to R2)
        song = Song.objects.create(**validated_data)

        # Read and reset pointer
        lrc_text = lrc_file.read().decode("utf-8")
        lrc_file.seek(0)

        parsed_lines = parse_lrc(lrc_text)

        SongLyricLine.objects.bulk_create([
            SongLyricLine(
                song=song,
                timestamp=line["timestamp"],
                text=line["text"]
            )
            for line in parsed_lines
        ])

        return song


# ─────────────────────────────────────────────
# Recording (READ – SECURE)
# ─────────────────────────────────────────────

class RecordingSerializer(serializers.ModelSerializer):
    song_title = serializers.CharField(source="song.title", read_only=True)
    audio_key = serializers.SerializerMethodField()

    class Meta:
        model = Recording
        fields = [
            "id",
            "song",
            "song_title",
            "audio_key",
            "duration",
            "created_at",
        ]

    def get_audio_key(self, obj):
        return obj.audio_file.name if obj.audio_file else None


# ─────────────────────────────────────────────
# Recording (UPLOAD)
# ─────────────────────────────────────────────

class RecordingUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recording
        fields = [
            "song",
            "audio_file",
        ]


class SongListSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)
    cover_url = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = [
            "id",
            "title",
            "artist",
            "language",
            "genre",
            "duration",
            "cover_url",
        ]

    def get_cover_url(self, obj):
        if not obj.cover_image:
            return None

        from .utils.r2 import generate_signed_url
        return generate_signed_url(
            key=obj.cover_image.name,
            expires=600  # 10 minutes (perfect for list pages)
        )
