"""
Diagnostic service — orchestrates the full diagnosis pipeline:
  1. Image pre-processing
  2. YOLO object detection
  3. RAG context retrieval
  4. Claude LLM reasoning
  5. Safety classification
  6. Instruction enrichment
  7. DB persistence
"""
import base64, json, uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.vision.image_preprocessing import preprocess, to_base64
from app.ai.vision.yolo_detector import detect_objects, format_detections_for_prompt
from app.ai.llm.reasoning_engine import (
    build_system_prompt, call_claude, parse_response,
    build_image_message, build_text_message,
)
from app.ai.llm.instruction_generator import enrich_steps, add_safety_step, format_tools
from app.ai.llm.followup_questions import get_followups
from app.ai.rag.retriever import retrieve_context
from app.ai.safety.severity_classifier import classify_severity
from app.ai.safety.danger_rules import check_danger_rules
from app.database.models.diagnostics import DiagnosticResult
from app.database.models.sessions import Session
from app.utils.logger import get_logger

log = get_logger(__name__)


async def run_image_diagnosis(
    image_bytes: bytes,
    media_type: str,
    category: str,
    skill_level: str,
    description: str,
    is_video_frame: bool,
    conversation_history: List[dict],
    media_path: str,
    db: AsyncSession,
    session_id: Optional[str] = None,
) -> dict:
    """Full pipeline for image/frame diagnosis."""

    # 1. Pre-process
    processed = preprocess(image_bytes)
    img_b64 = to_base64(processed)

    # 2. YOLO
    yolo_detections = detect_objects(processed)
    yolo_context = format_detections_for_prompt(yolo_detections)

    # 3. RAG
    rag_query = f"{category} {description or 'fault diagnosis'}"
    rag_context = retrieve_context(rag_query, category=category)

    # 4. Build prompt & call Claude
    system = build_system_prompt(category, skill_level, is_video_frame, yolo_context, rag_context)
    frame_note = f" (video frame)" if is_video_frame else ""
    user_text = (
        f"Analyze this{frame_note} image of my {category} and diagnose any visible issues."
        + (f"\n\nContext: {description}" if description else "")
        + f"\nSkill level: {skill_level}."
    )
    messages = conversation_history + [build_image_message(user_text, img_b64, media_type)]
    raw = call_claude(messages, system)
    parsed = parse_response(raw)

    # 5. Safety override
    diag = parsed.get("diagnosis") or {}
    final_severity = classify_severity(
        diag.get("issue"), parsed.get("warning"), diag.get("severity"), description
    )
    rule = check_danger_rules(f"{diag.get('issue','')} {description}")
    if rule and not parsed.get("warning"):
        parsed["warning"] = rule["warning"]
    if diag:
        diag["severity"] = final_severity
        parsed["diagnosis"] = diag

    # 6. Enrich steps
    steps = parsed.get("steps", [])
    steps = add_safety_step(steps, parsed.get("warning"))
    steps = enrich_steps(steps, skill_level)
    parsed["steps"] = steps
    parsed["tools"] = format_tools(parsed.get("tools", []))
    parsed["followups"] = get_followups(category, parsed.get("followups", []))

    # 7. Persist
    result_id = str(uuid.uuid4())
    db_record = DiagnosticResult(
        id=result_id,
        session_id=session_id,
        category=category,
        issue=diag.get("issue"),
        component=diag.get("component"),
        severity=final_severity,
        confidence=diag.get("confidence"),
        warning=parsed.get("warning"),
        steps_json=json.dumps(steps),
        tools_json=json.dumps(parsed.get("tools", [])),
        has_image=True,
        is_video_frame=is_video_frame,
        media_path=media_path,
        raw_response=raw,
    )
    db.add(db_record)
    await db.commit()

    parsed["session_id"] = result_id
    parsed["is_video_frame"] = is_video_frame
    return parsed


async def run_text_diagnosis(
    message: str,
    category: str,
    skill_level: str,
    conversation_history: List[dict],
    db: AsyncSession,
) -> dict:
    """Text-only follow-up diagnosis."""
    rag_context = retrieve_context(f"{category} {message}", category=category)
    system = build_system_prompt(category, skill_level, rag_context=rag_context)
    messages = conversation_history + [build_text_message(message)]
    raw = call_claude(messages, system)
    parsed = parse_response(raw)

    diag = parsed.get("diagnosis") or {}
    final_severity = classify_severity(diag.get("issue"), parsed.get("warning"), diag.get("severity"), message)
    if diag:
        diag["severity"] = final_severity
        parsed["diagnosis"] = diag

    steps = parsed.get("steps", [])
    steps = add_safety_step(steps, parsed.get("warning"))
    steps = enrich_steps(steps, skill_level)
    parsed["steps"] = steps
    parsed["tools"] = format_tools(parsed.get("tools", []))
    parsed["followups"] = get_followups(category, parsed.get("followups", []))

    result_id = str(uuid.uuid4())
    db_record = DiagnosticResult(
        id=result_id,
        category=category,
        issue=diag.get("issue"),
        severity=final_severity,
        raw_response=raw,
    )
    db.add(db_record)
    await db.commit()

    parsed["session_id"] = result_id
    parsed["is_video_frame"] = False
    return parsed
