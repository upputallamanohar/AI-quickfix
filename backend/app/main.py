"""
FixAI – FastAPI Application Entry Point
AI-Powered Visual Troubleshooting & Repair Assistant
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.config import settings
from app.database.db import init_db
from app.ai.rag.vector_store import seed_knowledge_base
from app.api.routes import upload, diagnostics, voice, chat
from app.utils.logger import get_logger

log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────────
    log.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await init_db()
    log.info("Database initialised.")
    seed_knowledge_base()
    log.info("Knowledge base seeded.")
    yield
    # ── Shutdown ─────────────────────────────────────────────────────────────
    log.info("Shutting down FixAI.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Visual Troubleshooting and Repair Assistant",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request timing middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def add_process_time(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = round((time.perf_counter() - start) * 1000, 1)
    response.headers["X-Process-Time-Ms"] = str(elapsed)
    return response


# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


# ── Routers ───────────────────────────────────────────────────────────────────
PREFIX = settings.API_V1_PREFIX
app.include_router(upload.router, prefix=PREFIX)
app.include_router(diagnostics.router, prefix=PREFIX)
app.include_router(voice.router, prefix=PREFIX)
app.include_router(chat.router, prefix=PREFIX)


# ── Health & root ─────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION, "status": "running"}


@app.get("/health")
async def health():
    from datetime import datetime
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
