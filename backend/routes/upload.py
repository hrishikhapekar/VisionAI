"""
/upload  – accepts an image file, validates it, saves it, returns a file_id.
"""
import os
import uuid
from fastapi import APIRouter, File, HTTPException, UploadFile

from utils.image_utils import load_and_preprocess, validate_extension, image_to_bytes

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_BYTES = int(os.getenv("MAX_FILE_SIZE_MB", 10)) * 1024 * 1024
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if not validate_extension(file.filename):
        raise HTTPException(400, "Unsupported file type. Use JPG, PNG, WEBP, or BMP.")

    raw = await file.read()
    if len(raw) > MAX_BYTES:
        raise HTTPException(413, f"File exceeds {MAX_BYTES // (1024*1024)} MB limit.")

    try:
        image = load_and_preprocess(raw)
    except Exception:
        raise HTTPException(422, "Could not decode image. Please upload a valid image file.")

    file_id = uuid.uuid4().hex
    save_path = os.path.join(UPLOAD_DIR, f"{file_id}.jpg")
    with open(save_path, "wb") as f:
        f.write(image_to_bytes(image))

    return {
        "file_id": file_id,
        "width": image.size[0],
        "height": image.size[1],
        "original_name": file.filename,
    }
