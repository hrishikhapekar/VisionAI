"""
AI Model Loader - loads all models once at startup for performance.
"""
import torch
from transformers import (
    BlipProcessor,
    BlipForConditionalGeneration,
    BlipForQuestionAnswering,
    DetrImageProcessor,
    DetrForObjectDetection,
)

device = "cuda" if torch.cuda.is_available() else "cpu"

# ── Caption model (BLIP base) ──────────────────────────────────────────────
caption_processor = BlipProcessor.from_pretrained(
    "Salesforce/blip-image-captioning-base"
)
caption_model = BlipForConditionalGeneration.from_pretrained(
    "Salesforce/blip-image-captioning-base"
).to(device)
caption_model.eval()

# ── VQA model (BLIP VQA) ──────────────────────────────────────────────────
vqa_processor = BlipProcessor.from_pretrained("Salesforce/blip-vqa-base")
vqa_model = BlipForQuestionAnswering.from_pretrained(
    "Salesforce/blip-vqa-base"
).to(device)
vqa_model.eval()

# ── Object detection model (DETR ResNet-50) ───────────────────────────────
detr_processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-50")
detr_model = DetrForObjectDetection.from_pretrained(
    "facebook/detr-resnet-50"
).to(device)
detr_model.eval()

print(f"✅ All models loaded on {device.upper()}")
