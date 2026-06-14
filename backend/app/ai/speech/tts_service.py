"""
Text-to-speech service.
Supports gTTS (Google, default), pyttsx3 (offline), ElevenLabs (premium).
"""
import io
from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)


def synthesize(text: str, lang: str = "en") -> bytes:
    """Convert text to speech. Returns raw audio bytes (MP3 or WAV)."""
    engine = settings.TTS_ENGINE
    if engine == "gtts":
        return _gtts(text, lang)
    if engine == "pyttsx3":
        return _pyttsx3(text)
    if engine == "elevenlabs":
        return _elevenlabs(text)
    return _gtts(text, lang)  # default fallback


def _gtts(text: str, lang: str) -> bytes:
    from gtts import gTTS
    tts = gTTS(text=text[:500], lang=lang, slow=False)
    buf = io.BytesIO()
    tts.write_to_fp(buf)
    return buf.getvalue()


def _pyttsx3(text: str) -> bytes:
    import pyttsx3, tempfile, os
    engine = pyttsx3.init()
    engine.setProperty("rate", 160)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp = f.name
    engine.save_to_file(text[:500], tmp)
    engine.runAndWait()
    with open(tmp, "rb") as f:
        data = f.read()
    os.unlink(tmp)
    return data


def _elevenlabs(text: str) -> bytes:
    import requests
    headers = {
        "xi-api-key": settings.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "text": text[:500],
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
    }
    voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel (default)
    r = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
        json=payload, headers=headers, timeout=15,
    )
    r.raise_for_status()
    return r.content
