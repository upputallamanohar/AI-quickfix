"""Request validators for uploads and payloads."""
from fastapi import HTTPException
from app.config import settings

def validate_image(content_type: str, size_bytes: int):
    if content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, f"Unsupported image type: {content_type}")
    if size_bytes > settings.MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise HTTPException(413, f"Image exceeds {settings.MAX_IMAGE_SIZE_MB}MB limit")

def validate_video(content_type: str, size_bytes: int):
    if content_type not in settings.ALLOWED_VIDEO_TYPES:
        raise HTTPException(400, f"Unsupported video type: {content_type}")
    if size_bytes > settings.MAX_VIDEO_SIZE_MB * 1024 * 1024:
        raise HTTPException(413, f"Video exceeds {settings.MAX_VIDEO_SIZE_MB}MB limit")

def validate_text_length(text: str, max_len: int = 4000):
    if len(text) > max_len:
        raise HTTPException(400, f"Text exceeds {max_len} character limit")
