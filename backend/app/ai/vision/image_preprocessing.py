"""
Image pre-processing pipeline.
Resizes, normalises and converts images before sending to YOLO or Claude.
"""
import io, base64
from PIL import Image, ImageEnhance, ImageFilter
from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)

MAX_SIDE = 1280  # pixels


def preprocess(raw: bytes, enhance: bool = True) -> bytes:
    """Resize, optionally enhance contrast/sharpness, return JPEG bytes."""
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    # Resize
    img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    if enhance:
        img = ImageEnhance.Contrast(img).enhance(1.2)
        img = ImageEnhance.Sharpness(img).enhance(1.3)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=88, optimize=True)
    result = buf.getvalue()
    log.debug(f"Preprocessed image: {len(raw)} → {len(result)} bytes, size={img.size}")
    return result


def to_base64(raw: bytes) -> str:
    return base64.b64encode(raw).decode("utf-8")


def bytes_to_pil(raw: bytes) -> Image.Image:
    return Image.open(io.BytesIO(raw)).convert("RGB")
