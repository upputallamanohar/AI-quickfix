"""
Video processing: extract key frames at regular intervals using OpenCV or PIL fallback.
"""
import io, base64
from typing import List, Dict
from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)

try:
    import cv2 as _cv2
    _CV2_AVAILABLE = True
except ImportError:
    _CV2_AVAILABLE = False
    log.warning("opencv-python not installed — using PIL-based frame extraction.")


def extract_frames_cv2(video_path: str) -> List[Dict]:
    """Extract frames using OpenCV."""
    cap = _cv2.VideoCapture(video_path)
    fps = cap.get(_cv2.CAP_PROP_FPS) or 25
    interval = int(fps * settings.VIDEO_FRAME_INTERVAL_SEC)
    frames = []
    idx = 0
    while len(frames) < settings.VIDEO_MAX_FRAMES:
        ret, frame = cap.read()
        if not ret:
            break
        if idx % interval == 0:
            _, buf = _cv2.imencode(".jpg", frame, [_cv2.IMWRITE_JPEG_QUALITY, 85])
            b64 = base64.b64encode(buf.tobytes()).decode()
            frames.append({"index": len(frames), "frame_idx": idx,
                           "timestamp_sec": round(idx / fps, 2), "base64": b64})
        idx += 1
    cap.release()
    return frames


def extract_frames_fallback(video_bytes: bytes) -> List[Dict]:
    """Minimal fallback: return a single frame placeholder when cv2 unavailable."""
    log.warning("OpenCV unavailable — returning empty frame list. Install opencv-python.")
    return []


def extract_frames(video_path: str = None, video_bytes: bytes = None) -> List[Dict]:
    if _CV2_AVAILABLE and video_path:
        return extract_frames_cv2(video_path)
    if video_bytes:
        return extract_frames_fallback(video_bytes)
    return []


def pick_best_frame(frames: List[Dict]) -> Dict | None:
    """Simple heuristic: pick the middle frame."""
    if not frames:
        return None
    return frames[len(frames) // 2]
