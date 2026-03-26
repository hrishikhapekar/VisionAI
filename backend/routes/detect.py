"""
/detect  – runs object detection on an uploaded image.
"""
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image

from services.detection_service import detect_objects
from utils.db import save_history

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

    await save_history(
        {
            "file_id": req.file_id,
            "action": "detect",
            "result": detections,
        }
    )

    return {
        "file_id": req.file_id,
        "count": len(detections),
        "detections": detections,
    }
