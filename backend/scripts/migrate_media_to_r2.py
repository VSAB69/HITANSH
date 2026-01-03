import os
import mimetypes
import boto3
from pathlib import Path

BUCKET = os.getenv("R2_BUCKET_NAME")
ENDPOINT = os.getenv("R2_ENDPOINT")
ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID")
SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY")

assert BUCKET, "R2_BUCKET_NAME missing"
assert ENDPOINT, "R2_ENDPOINT missing"

s3 = boto3.client(
    "s3",
    endpoint_url=ENDPOINT,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
)

MEDIA_ROOT = Path("media")

for file_path in MEDIA_ROOT.rglob("*"):
    if not file_path.is_file():
        continue

    # Skip files without extension (important!)
    if file_path.suffix == "":
        continue

    # R2 key (always forward slash)
    r2_key = str(file_path.relative_to(MEDIA_ROOT)).replace("\\", "/")

    content_type, _ = mimetypes.guess_type(file_path)

    print(f"Uploading {file_path} → {r2_key}")

    s3.upload_file(
        Filename=str(file_path),
        Bucket=BUCKET,
        Key=r2_key,
        ExtraArgs={
            "ContentType": content_type or "application/octet-stream"
        }
    )

print("✅ Media migration completed successfully")
