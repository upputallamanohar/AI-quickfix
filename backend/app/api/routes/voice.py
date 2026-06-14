"""
/voice routes — speech-to-text (Whisper) and text-to-speech.
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from app.ai.speech.whisper_service import transcribe_audio
from app.ai.speech.tts_service import synthesize
from app.services.upload_service import save_audio
from app.utils.logger import get_logger

router = APIRouter(prefix="/voice", tags=["voice"])
log = get_logger(__name__)


@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language: str = Form("en"),
):
    """Convert uploaded audio to text using Whisper."""
    _, raw = await save_audio(audio)
    try:
        text = transcribe_audio(raw, language=language)
        return {"transcript": text, "language": language}
    except Exception as e:
        log.error(f"Transcription error: {e}")
        raise HTTPException(500, f"Transcription failed: {str(e)}")


@router.post("/synthesize")
async def text_to_speech(
    text: str = Form(...),
    lang: str = Form("en"),
):
    """Convert text to speech audio. Returns MP3 bytes."""
    try:
        audio_bytes = synthesize(text, lang=lang)
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"},
        )
    except Exception as e:
        log.error(f"TTS error: {e}")
        raise HTTPException(500, f"TTS failed: {str(e)}")
