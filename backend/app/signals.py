from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from django.core.files.storage import default_storage
from .models import Song, Recording


# ─────────────────────────────────────────────
# DELETE FILES WHEN MODEL IS DELETED
# ─────────────────────────────────────────────

@receiver(post_delete, sender=Song)
def delete_song_files(sender, instance, **kwargs):
    for field in ["cover_image", "audio_file", "lrc_file"]:
        file = getattr(instance, field, None)
        if file and default_storage.exists(file.name):
            default_storage.delete(file.name)


@receiver(post_delete, sender=Recording)
def delete_recording_file(sender, instance, **kwargs):
    if instance.audio_file and default_storage.exists(instance.audio_file.name):
        default_storage.delete(instance.audio_file.name)


# ─────────────────────────────────────────────
# DELETE OLD FILES WHEN FILE IS REPLACED
# ─────────────────────────────────────────────

@receiver(pre_save, sender=Song)
def replace_song_files(sender, instance, **kwargs):
    if not instance.pk:
        return  # New object

    try:
        old = Song.objects.get(pk=instance.pk)
    except Song.DoesNotExist:
        return

    for field in ["cover_image", "audio_file", "lrc_file"]:
        old_file = getattr(old, field)
        new_file = getattr(instance, field)

        if old_file and old_file != new_file:
            if default_storage.exists(old_file.name):
                default_storage.delete(old_file.name)


@receiver(pre_save, sender=Recording)
def replace_recording_file(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old = Recording.objects.get(pk=instance.pk)
    except Recording.DoesNotExist:
        return

    if old.audio_file and old.audio_file != instance.audio_file:
        if default_storage.exists(old.audio_file.name):
            default_storage.delete(old.audio_file.name)



from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Song, SongLyricLine
from .utils import parse_lrc


@receiver(pre_save, sender=Song)
def reparse_lrc_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old = Song.objects.get(pk=instance.pk)
    except Song.DoesNotExist:
        return

    if old.lrc_file != instance.lrc_file and instance.lrc_file:
        # Delete old lyrics
        SongLyricLine.objects.filter(song=instance).delete()

        # Parse new LRC
        lrc_text = instance.lrc_file.read().decode("utf-8")
        instance.lrc_file.seek(0)

        SongLyricLine.objects.bulk_create([
            SongLyricLine(
                song=instance,
                timestamp=line["timestamp"],
                text=line["text"]
            )
            for line in parse_lrc(lrc_text)
        ])
