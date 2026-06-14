"""
/chat routes — WebSocket and REST conversational endpoint.
"""
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List
from app.database.db import get_db
from app.services.diagnostic_service import run_text_diagnosis
from app.services.conversation_service import get_or_create_session, get_session_history, close_session
from app.utils.logger import get_logger

router = APIRouter(prefix="/chat", tags=["chat"])
log = get_logger(__name__)

# Active WebSocket connections: session_id -> WebSocket
_connections: dict[str, WebSocket] = {}


class ChatMessage(BaseModel):
    session_id: str | None = None
    category: str = "General"
    skill_level: str = "intermediate"
    message: str
    conversation_history: List[dict] = []


@router.post("/message")
async def chat_message(req: ChatMessage, db: AsyncSession = Depends(get_db)):
    """REST endpoint for single-turn chat message."""
    session = await get_or_create_session(db, req.session_id, req.category, req.skill_level)
    result = await run_text_diagnosis(
        message=req.message,
        category=req.category,
        skill_level=req.skill_level,
        conversation_history=req.conversation_history,
        db=db,
    )
    result["chat_session_id"] = session.id
    return result


@router.get("/session/{session_id}/history")
async def session_history(session_id: str, db: AsyncSession = Depends(get_db)):
    history = await get_session_history(db, session_id)
    return {"session_id": session_id, "history": history}


@router.post("/session/{session_id}/close")
async def close_chat_session(session_id: str, db: AsyncSession = Depends(get_db)):
    await close_session(db, session_id, summary="Closed by user.")
    return {"status": "closed", "session_id": session_id}


@router.websocket("/ws/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    """
    Real-time WebSocket chat.
    Client sends: {"message": "...", "category": "...", "skill_level": "...", "history": [...]}
    Server responds: JSON diagnosis result.
    """
    await websocket.accept()
    _connections[session_id] = websocket
    log.info(f"WebSocket connected: session={session_id}")

    async def get_db_session():
        from app.database.db import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            return db

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            category = payload.get("category", "General")
            skill_level = payload.get("skill_level", "intermediate")
            message = payload.get("message", "")
            history = payload.get("history", [])

            if not message.strip():
                continue

            db = await get_db_session()
            try:
                result = await run_text_diagnosis(
                    message=message,
                    category=category,
                    skill_level=skill_level,
                    conversation_history=history,
                    db=db,
                )
                await websocket.send_text(json.dumps(result))
            finally:
                await db.close()

    except WebSocketDisconnect:
        log.info(f"WebSocket disconnected: session={session_id}")
        _connections.pop(session_id, None)
    except Exception as e:
        log.error(f"WebSocket error: {e}")
        try:
            await websocket.send_text(json.dumps({"error": str(e)}))
        except Exception:
            pass
        _connections.pop(session_id, None)
