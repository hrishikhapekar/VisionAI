import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from PIL import Image

from services.vqa_service import answer_question

router = APIRouter()
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")


class VQARequest(BaseModel):
    file_id: str
    question: str


@router.post("/ask")
async def ask(req: VQARequest):
    if not req.question.strip():
        raise HTTPException(400, "Question cannot be empty.")

    path = os.path.join(UPLOAD_DIR, f"{req.file_id}.jpg")
    if not os.path.exists(path):
        raise HTTPException(404, "Image not found. Upload first.")

    image = Image.open(path)
    answer = answer_question(image, req.question)
    return {"file_id": req.file_id, "question": req.question, "answer": answer}
