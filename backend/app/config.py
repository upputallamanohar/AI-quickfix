"""
FixAI – Central Configuration
All settings loaded from environment variables with safe defaults.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "FixAI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production"
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    MAX_TOKENS: int = 2000
    OPENAI_API_KEY: str = ""
    WHISPER_MODEL: str = "base"
    DATABASE_URL: str = "sqlite:///./fixai.db"
    UPLOAD_DIR: str = "uploads"
    MAX_IMAGE_SIZE_MB: int = 20
    MAX_VIDEO_SIZE_MB: int = 200
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg","image/png","image/webp","image/gif"]
    ALLOWED_VIDEO_TYPES: List[str] = ["video/mp4","video/quicktime","video/webm","video/avi"]
    VECTOR_STORE_PATH: str = "vector_store"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    RAG_TOP_K: int = 5
    TTS_ENGINE: str = "gtts"
    ELEVENLABS_API_KEY: str = ""
    YOLO_MODEL_PATH: str = "models/yolov8n.pt"
    YOLO_CONFIDENCE: float = 0.35
    VIDEO_FRAME_INTERVAL_SEC: float = 2.0
    VIDEO_MAX_FRAMES: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()