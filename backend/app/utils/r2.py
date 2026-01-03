import boto3
from django.conf import settings
from botocore.config import Config


def generate_signed_url(key: str, expires: int = 300) -> str:
    """
    Generate a short-lived signed URL for a PRIVATE Cloudflare R2 object.
    """

    s3 = boto3.client(
        "s3",
        endpoint_url=settings.AWS_S3_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "path"},
        ),
        region_name="auto",
    )

    return s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": settings.AWS_STORAGE_BUCKET_NAME,
            "Key": key,
        },
        ExpiresIn=expires,
    )
