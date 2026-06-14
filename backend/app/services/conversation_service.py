"""
Conversation service — manages multi-turn session state and history.
"""
import json
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.models.sessions import Session
from app.database.models.diagnostics import DiagnosticResult
from app.utils.logger import get_logger

log = get_logger(__name__)


async def get_or_create_session(
    db: AsyncSession,
    session_id: Optional[str],
    category: str,
    skill_level: str,
) -> Session:
    if session_id:
        result = await db.execute(select(Session).where(Session.id == session_id))
        existing = result.scalar_one_or_none()
        if existing:
            return existing
    new_session = Session(category=category, skill_level=skill_level)
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    return new_session


async def get_session_history(db: AsyncSession, session_id: str) -> List[dict]:
    """Retrieve all diagnostic results for a session."""
    result = await db.execute(
        select(DiagnosticResult)
        .where(DiagnosticResult.session_id == session_id)
        .order_by(DiagnosticResult.created_at)
    )
    records = result.scalars().all()
    history = []
    for r in records:
        history.append({
            "id": r.id,
            "issue": r.issue,
            "component": r.component,
            "severity": r.severity,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return history


async def close_session(db: AsyncSession, session_id: str, summary: str = ""):
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if session:
        session.status = "resolved"
        session.summary = summary
        await db.commit()


def build_history_messages(raw_history: List[dict]) -> List[dict]:
    """Convert stored role/content pairs to Claude message format."""
    return [{"role": h["role"], "content": h["content"]} for h in raw_history]
