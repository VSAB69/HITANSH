import os
import mimetypes

from django.conf import settings
from django.http import StreamingHttpResponse, Http404
from django.views import View


def file_iterator(path, offset=0, length=None, chunk_size=8192):
    """
    Generator that opens the file itself and keeps it open
    for the duration of streaming.
    """
    with open(path, "rb") as f:
        f.seek(offset)
        remaining = length

        while True:
            if remaining is None:
                data = f.read(chunk_size)
            else:
                if remaining <= 0:
                    break
                data = f.read(min(chunk_size, remaining))
                remaining -= len(data)

            if not data:
                break
            yield data


class MediaStreamView(View):
    def get(self, request, path):
        full_path = os.path.join(settings.MEDIA_ROOT, path)

        if not os.path.exists(full_path):
            raise Http404("File not found")

        file_size = os.path.getsize(full_path)
        content_type, _ = mimetypes.guess_type(full_path)
        content_type = content_type or "application/octet-stream"

        range_header = request.headers.get("Range")

        if range_header:
            # Example: bytes=12345-
            start_str, end_str = range_header.replace("bytes=", "").split("-")
            start = int(start_str)
            end = int(end_str) if end_str else file_size - 1
            end = min(end, file_size - 1)
            length = end - start + 1

            response = StreamingHttpResponse(
                file_iterator(full_path, offset=start, length=length),
                status=206,
                content_type=content_type,
            )

            response["Content-Range"] = f"bytes {start}-{end}/{file_size}"
            response["Content-Length"] = str(length)
        else:
            response = StreamingHttpResponse(
                file_iterator(full_path),
                content_type=content_type,
            )
            response["Content-Length"] = str(file_size)

        response["Accept-Ranges"] = "bytes"
        response["Cache-Control"] = "public, max-age=86400"

        return response
