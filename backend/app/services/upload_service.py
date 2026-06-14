"""
Upload service — saves uploaded files to disk, validates type/size.
"""
import os, uuid, aiofiles
from fastapi import UploadFile, HTTPException
from app.config import settings
from app.utils.validators import validate_image, validate_video
from app.utils.logger import get_logger

log = get_logger(__name__)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


async def save_image(file: UploadFile) -> tuple[str, bytes]:
    """Validate, save, and return (saved_path, raw_bytes)."""
    raw = await file.read()
    validate_image(file.content_type or "image/jpeg", len(raw))
    ext = (file.filename or "img.jpg").rsplit(".", 1)[-1].lower()
    fname = f"{uuid.uuid4().hex}.{ext}"
    path = os.path.join(settings.UPLOAD_DIR, fname)
    async with aiofiles.open(path, "wb") as f:
        await f.write(raw)
    log.info(f"Image saved: {path} ({len(raw)} bytes)")
    return path, raw


async def save_video(file: UploadFile) -> tuple[str, bytes]:
    """Validate, save, and return (saved_path, raw_bytes)."""
    raw = await file.read()
    validate_video(file.content_type or "video/mp4", len(raw))
    ext = (file.filename or "video.mp4").rsplit(".", 1)[-1].lower()
    fname = f"{uuid.uuid4().hex}.{ext}"
    path = os.path.join(settings.UPLOAD_DIR, fname)
    async with aiofiles.open(path, "wb") as f:
        await f.write(raw)
    log.info(f"Video saved: {path} ({len(raw)} bytes)")
    return path, raw


async def save_audio(file: UploadFile) -> tuple[str, bytes]:
    raw = await file.read()
    fname = f"{uuid.uuid4().hex}.wav"
    path = os.path.join(settings.UPLOAD_DIR, fname)
    async with aiofiles.open(path, "wb") as f:
        await f.write(raw)
    return path, raw
