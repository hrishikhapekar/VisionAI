"""
Object detection service using DETR ResNet-50.
"""
import torch
from PIL import Image
from models import detr_model, detr_processor, device

CONFIDENCE_THRESHOLD = 0.7


def detect_objects(image: Image.Image) -> list[dict]:
    """Return list of detected objects with label, confidence, and bounding box."""
    inputs = detr_processor(images=image, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = detr_model(**inputs)

    target_sizes = torch.tensor([image.size[::-1]])  # (height, width)
    results = detr_processor.post_process_object_detection(
        outputs, threshold=CONFIDENCE_THRESHOLD, target_sizes=target_sizes
    )[0]

    detections = []
    for score, label, box in zip(
        results["scores"], results["labels"], results["boxes"]
    ):
        box_list = [round(v, 2) for v in box.tolist()]
        detections.append(
            {
                "label": detr_model.config.id2label[label.item()],
                "confidence": round(score.item(), 4),
                "box": {
                    "x1": box_list[0],
                    "y1": box_list[1],
                    "x2": box_list[2],
                    "y2": box_list[3],
                },
            }
        )

    # sort by confidence descending
    detections.sort(key=lambda x: x["confidence"], reverse=True)
    return detections
