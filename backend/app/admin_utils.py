from django.utils.html import format_html
from .utils.r2 import generate_signed_url


def signed_image_preview(file_field, width=120):
    if not file_field:
        return "—"

    url = generate_signed_url(file_field.name, expires=300)
    return format_html(
        '<img src="{}" style="max-width:{}px; border-radius:8px;" />',
        url,
        width,
    )


def signed_audio_preview(file_field):
    if not file_field:
        return "—"

    url = generate_signed_url(file_field.name, expires=300)
    return format_html(
        '<audio controls style="width:250px;"><source src="{}"></audio>',
        url,
    )


def signed_file_link(file_field, label="Download"):
    if not file_field:
        return "—"

    url = generate_signed_url(file_field.name, expires=300)
    return format_html(
        '<a href="{}" target="_blank">{}</a>',
        url,
        label,
    )
