"""
Caption service - generates short, detailed, and styled captions.
"""
import torch
from PIL import Image
from models import caption_model, caption_processor, device

STYLE_PROMPTS = {
    "short":       "",
    "detailed":    "a detailed description of",
    "formal":      "a formal description of",
    "casual":      "a casual description of",
    "funny":       "a funny description of",
    "storytelling":"a story about",
}


def _generate(image: Image.Image, prompt: str, max_new_tokens: int = 100) -> str:
    inputs = caption_processor(image, prompt if prompt else None, return_tensors="pt").to(device)
    with torch.no_grad():
        out = caption_model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            num_beams=5,
            early_stopping=True,
        )
    return caption_processor.decode(out[0], skip_special_tokens=True).strip()


def generate_captions(image: Image.Image) -> dict:
    """Return captions for all styles plus top-3 beam outputs."""
    results = {style: _generate(image, prompt) for style, prompt in STYLE_PROMPTS.items()}

    # top-3 diverse captions via beam search
    inputs = caption_processor(image, return_tensors="pt").to(device)
    with torch.no_grad():
        out = caption_model.generate(
            **inputs,
            num_beams=6,
            num_return_sequences=3,
            max_new_tokens=80,
        )
    results["top3"] = [
        caption_processor.decode(o, skip_special_tokens=True).strip() for o in out
    ]
    return results
