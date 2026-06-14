"""Image utility helpers."""
import base64, io
from PIL import Image

def bytes_to_base64(data: bytes, fmt: str = "JPEG") -> str:
    return base64.b64encode(data).decode("utf-8")

def resize_image(data: bytes, max_size: int = 1024) -> bytes:
    img = Image.open(io.BytesIO(data)).convert("RGB")
    img.thumbnail((max_size, max_size), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()

def get_image_dimensions(data: bytes) -> tuple[int, int]:
    img = Image.open(io.BytesIO(data))
    return img.size  # (width, height)

def normalize_media_type(content_type: str) -> str:
    mapping = {"image/jpg": "image/jpeg", "image/jfif": "image/jpeg"}
    return mapping.get(content_type, content_type)
