import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image

from services.detection_service import detect_objects

router = APIRouter()
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")


class DetectRequest(BaseModel):
    file_id: str


@router.post("/detect")
async def detect(req: DetectRequest):
    path = os.path.join(UPLOAD_DIR, f"{req.file_id}.jpg")
    if not os.path.exists(path):
        raise HTTPException(404, "Image not found. Upload first.")

    image = Image.open(path)
    detections = detect_objects(image)
    return {"file_id": req.file_id, "count": len(detections), "detections": detections}
