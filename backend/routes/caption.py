import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image

from services.caption_service import generate_captions

router = APIRouter()
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")


class CaptionRequest(BaseModel):
    file_id: str


@router.post("/caption")
async def caption_image(req: CaptionRequest):
    path = os.path.join(UPLOAD_DIR, f"{req.file_id}.jpg")
    if not os.path.exists(path):
        raise HTTPException(404, "Image not found. Upload first.")

    image = Image.open(path)
    captions = generate_captions(image)
    return {"file_id": req.file_id, "captions": captions}
