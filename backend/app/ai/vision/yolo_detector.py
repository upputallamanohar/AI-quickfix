"""
YOLO-based object / fault detector.
Falls back gracefully if ultralytics is not installed.
"""
from typing import List, Dict, Any
from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)

try:
    from ultralytics import YOLO as _YOLO
    _YOLO_AVAILABLE = True
except ImportError:
    _YOLO_AVAILABLE = False
    log.warning("ultralytics not installed — YOLO detection disabled, falling back to Claude vision only.")

_model = None  # lazy-loaded


def _get_model():
    global _model
    if _model is None and _YOLO_AVAILABLE:
        try:
            _model = _YOLO(settings.YOLO_MODEL_PATH)
            log.info(f"YOLO model loaded from {settings.YOLO_MODEL_PATH}")
        except Exception as e:
            log.error(f"Failed to load YOLO model: {e}")
    return _model


def detect_objects(image_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Run YOLO on raw image bytes.
    Returns a list of detections: [{label, confidence, bbox}]
    """
    model = _get_model()
    if model is None:
        return []

    import io
    from PIL import Image
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    results = model(img, conf=settings.YOLO_CONFIDENCE, verbose=False)
    detections = []
    for r in results:
        for box in r.boxes:
            detections.append({
                "label": r.names[int(box.cls)],
                "confidence": round(float(box.conf), 3),
                "bbox": [round(float(x), 1) for x in box.xyxy[0].tolist()],
            })
    log.debug(f"YOLO detections: {detections}")
    return detections


def format_detections_for_prompt(detections: List[Dict]) -> str:
    """Convert detection list into a readable string for the LLM prompt."""
    if not detections:
        return ""
    lines = ["Computer vision pre-analysis detected:"]
    for d in detections[:10]:
        lines.append(f"  • {d['label']} (confidence: {d['confidence']:.0%})")
    return "\n".join(lines)
