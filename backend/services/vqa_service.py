"""
Visual Question Answering service using BLIP VQA.
"""
import torch
from PIL import Image
from models import vqa_model, vqa_processor, device


def answer_question(image: Image.Image, question: str) -> str:
    """Return an AI-generated answer for the given question about the image."""
    inputs = vqa_processor(image, question, return_tensors="pt").to(device)
    with torch.no_grad():
        out = vqa_model.generate(**inputs, max_new_tokens=50)
    return vqa_processor.decode(out[0], skip_special_tokens=True).strip()
