from rest_framework import serializers
from .models import Song, SongLyricLine, Artist

class SongLyricLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = SongLyricLine
        fields = ["timestamp", "text"]


class SongSerializer(serializers.ModelSerializer):
    lyrics = SongLyricLineSerializer(many=True, read_only=True)

    class Meta:
        model = Song
        fields = [
            "id", "title", "artist", "language", "genre",
            "cover_image", "audio_file", "duration", "lyrics"
        ]


class SongUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = [
            "title", "artist", "language", "genre",
            "cover_image", "audio_file", "lrc_file",
            "duration"
        ]

    def create(self, validated_data):
        from .utils import parse_lrc
        from .models import SongLyricLine

        lrc_file = validated_data.get("lrc_file")

        # Save the song first
        song = Song.objects.create(**validated_data)

        # Parse the LRC
        lrc_text = lrc_file.read().decode("utf-8")
        parsed_lines = parse_lrc(lrc_text)

        # Create lyric lines
        bulk_list = [
            SongLyricLine(song=song, timestamp=line["timestamp"], text=line["text"])
            for line in parsed_lines
        ]
        SongLyricLine.objects.bulk_create(bulk_list)

        return song


from rest_framework import serializers
from .models import Recording

class RecordingSerializer(serializers.ModelSerializer):
    song_title = serializers.CharField(source="song.title", read_only=True)
    

    class Meta:
        model = Recording
        fields = [
            "id",
            "song",
            "song_title",
            "audio_file",
            "duration",
            "created_at",
        ]
