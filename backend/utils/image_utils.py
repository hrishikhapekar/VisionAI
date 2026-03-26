"""
Image preprocessing utilities.
"""
import io
import os
from PIL import Image

MAX_DIMENSION = 1024  # resize large images to keep inference fast


def load_and_preprocess(file_bytes: bytes) -> Image.Image:
    """Load image from bytes, convert to RGB, and resize if too large."""
    image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    w, h = image.size
    if max(w, h) > MAX_DIMENSION:
        scale = MAX_DIMENSION / max(w, h)
        image = image.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    return image


def validate_extension(filename: str) -> bool:
    allowed = {"jpg", "jpeg", "png", "webp", "bmp"}
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in allowed


def image_to_bytes(image: Image.Image, fmt: str = "JPEG") -> bytes:
    buf = io.BytesIO()
    image.save(buf, format=fmt)
    return buf.getvalue()
