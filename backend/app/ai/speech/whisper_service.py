"""
Whisper speech-to-text service.
Supports: local whisper model, or OpenAI Whisper API as fallback.
"""
import io
from typing import Optional
from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)

try:
    import whisper as _whisper
    _model = _whisper.load_model(settings.WHISPER_MODEL)
    _LOCAL_AVAILABLE = True
    log.info(f"Local Whisper model '{settings.WHISPER_MODEL}' loaded.")
except ImportError:
    _LOCAL_AVAILABLE = False
    _model = None
    log.warning("openai-whisper not installed — will try OpenAI API fallback.")


def transcribe_audio(audio_bytes: bytes, language: str = "en") -> str:
    """
    Transcribe raw audio bytes to text.
    Tries local Whisper first, then OpenAI API.
    """
    if _LOCAL_AVAILABLE and _model:
        return _transcribe_local(audio_bytes, language)
    return _transcribe_openai_api(audio_bytes, language)


def _transcribe_local(audio_bytes: bytes, language: str) -> str:
    import tempfile, os
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(audio_bytes)
        tmp_path = f.name
    try:
        result = _model.transcribe(tmp_path, language=language, fp16=False)
        text = result.get("text", "").strip()
        log.debug(f"Whisper local transcript: {text[:80]}")
        return text
    finally:
        os.unlink(tmp_path)


def _transcribe_openai_api(audio_bytes: bytes, language: str) -> str:
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("Neither local Whisper nor OPENAI_API_KEY is available.")
    import openai
    openai.api_key = settings.OPENAI_API_KEY
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = "audio.wav"
    transcript = openai.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        language=language,
    )
    return transcript.text.strip()
