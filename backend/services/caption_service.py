"""
Caption service - generates short, detailed, and styled captions.
"""
import torch
from PIL import Image
from models import caption_model, caption_processor, device


def _base_caption(image: Image.Image, max_new_tokens: int = 120) -> str:
    """Generate a clean base caption with repetition controls."""
    inputs = caption_processor(image, return_tensors="pt").to(device)
    with torch.no_grad():
        out = caption_model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            num_beams=5,
            early_stopping=True,
            no_repeat_ngram_size=3,
            repetition_penalty=1.5,
            length_penalty=1.0,
        )
    return caption_processor.decode(out[0], skip_special_tokens=True).strip()


def _style_caption(base: str, style: str) -> str:
    """Derive styled captions from the base caption via simple transforms."""
    s = base.rstrip(".")
    if style == "short":
        # First sentence or first 8 words
        words = s.split()
        return " ".join(words[:8]) + "." if len(words) > 8 else s + "."
    if style == "detailed":
        return f"{s}, captured in vivid detail with rich visual context."
    if style == "formal":
        return f"The image depicts {s}."
    if style == "casual":
        return f"Looks like {s}!"
    if style == "funny":
        return f"Nobody asked, but here we are — {s} 😄"
    if style == "storytelling":
        return f"Once upon a moment, {s} — a scene frozen in time."
    return s


def generate_captions(image: Image.Image) -> dict:
    """Return captions for all styles plus top-3 diverse beam outputs."""
    base = _base_caption(image)

    styles = ["short", "detailed", "formal", "casual", "funny", "storytelling"]
    results = {style: _style_caption(base, style) for style in styles}

    # Top-3 diverse captions via diverse beam search
    inputs = caption_processor(image, return_tensors="pt").to(device)
    with torch.no_grad():
        out = caption_model.generate(
            **inputs,
            num_beams=6,
            num_beam_groups=3,
            num_return_sequences=3,
            max_new_tokens=100,
            no_repeat_ngram_size=3,
            repetition_penalty=1.5,
            diversity_penalty=0.8,
        )
    results["top3"] = [
        caption_processor.decode(o, skip_special_tokens=True).strip() for o in out
    ]
    return results
