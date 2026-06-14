"""
/upload routes — accept images and videos, return metadata.
"""
from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.db import get_db
from app.services.upload_service import save_image, save_video
from app.utils.logger import get_logger

router = APIRouter(prefix="/upload", tags=["upload"])
log = get_logger(__name__)


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    path, raw = await save_image(file)
    return {
        "status": "uploaded",
        "path": path,
        "filename": file.filename,
        "size_bytes": len(raw),
        "content_type": file.content_type,
    }


@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    path, raw = await save_video(file)
    return {
        "status": "uploaded",
        "path": path,
        "filename": file.filename,
        "size_bytes": len(raw),
        "content_type": file.content_type,
    }
