"""
/diagnostics routes — image, video-frame, and text-only diagnosis.
"""
import json
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database.db import get_db
from app.database.models.diagnostics import DiagnosticResult
from app.services.upload_service import save_image
from app.services.diagnostic_service import run_image_diagnosis, run_text_diagnosis
from app.utils.logger import get_logger
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/diagnostics", tags=["diagnostics"])
log = get_logger(__name__)


class TextRequest(BaseModel):
    message: str
    category: str = "General"
    skill_level: str = "intermediate"
    conversation_history: List[dict] = []


@router.post("/image")
async def diagnose_image(
    image: UploadFile = File(...),
    category: str = Form("General"),
    skill_level: str = Form("intermediate"),
    description: str = Form(""),
    is_video_frame: bool = Form(False),
    conversation_history: str = Form("[]"),
    session_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
):
    path, raw = await save_image(image)
    try:
        hist = json.loads(conversation_history)
    except Exception:
        hist = []

    result = await run_image_diagnosis(
        image_bytes=raw,
        media_type=image.content_type or "image/jpeg",
        category=category,
        skill_level=skill_level,
        description=description,
        is_video_frame=is_video_frame,
        conversation_history=hist,
        media_path=path,
        db=db,
        session_id=session_id,
    )
    return result


@router.post("/text")
async def diagnose_text(req: TextRequest, db: AsyncSession = Depends(get_db)):
    return await run_text_diagnosis(
        message=req.message,
        category=req.category,
        skill_level=req.skill_level,
        conversation_history=req.conversation_history,
        db=db,
    )


@router.get("/history")
async def get_history(limit: int = 30, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(DiagnosticResult).order_by(desc(DiagnosticResult.created_at)).limit(limit)
    )
    records = result.scalars().all()
    return {
        "history": [
            {
                "id": r.id,
                "category": r.category,
                "issue": r.issue,
                "component": r.component,
                "severity": r.severity,
                "confidence": r.confidence,
                "has_image": r.has_image,
                "is_video_frame": r.is_video_frame,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in records
        ],
        "total": len(records),
    }


@router.delete("/history/{record_id}")
async def delete_history(record_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DiagnosticResult).where(DiagnosticResult.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, "Record not found")
    await db.delete(record)
    await db.commit()
    return {"deleted": record_id}


@router.get("/categories")
async def list_categories():
    return {
        "categories": [
            {"id": "Automobile", "label": "Automobile", "icon": "🚗"},
            {"id": "Motorcycle", "label": "Motorcycle / Bike", "icon": "🏍️"},
            {"id": "Electronics", "label": "Electronics", "icon": "📱"},
            {"id": "Home Appliance", "label": "Home Appliance", "icon": "🏠"},
            {"id": "Plumbing", "label": "Plumbing", "icon": "🚰"},
            {"id": "Networking Device", "label": "Networking Device", "icon": "📡"},
            {"id": "Industrial Machinery", "label": "Industrial Machinery", "icon": "⚙️"},
            {"id": "Computer / Hardware", "label": "Computer / Hardware", "icon": "💻"},
        ]
    }
