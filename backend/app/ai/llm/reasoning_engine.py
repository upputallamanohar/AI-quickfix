"""
Core LLM reasoning engine — builds prompts and calls Gemini API.
"""
import json
import google.generativeai as genai
from typing import List, Optional
from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)
genai.configure(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT_TEMPLATE = """You are FixAI, an expert AI-powered visual troubleshooting and repair assistant.
You analyze images and video frames to detect faults, diagnose problems, and guide users step-by-step through repairs.

Device category: {category}
User skill level: {skill_level}
{video_note}
{yolo_note}
{rag_note}

Capabilities:
- Visual fault detection and root-cause analysis
- Severity and safety risk assessment
- Step-by-step repair guidance adapted to skill level
- Safety warnings for dangerous situations
- Tool and replacement part recommendations

ALWAYS respond with a valid JSON object only (no markdown fences, no preamble):
{{
  "message": "Conversational explanation of findings and next steps",
  "diagnosis": {{
    "issue": "Detected issue name",
    "component": "Affected component or subsystem",
    "severity": "Low | Medium | High",
    "confidence": 85
  }},
  "warning": "Critical safety warning or null",
  "steps": ["Step 1 ...", "Step 2 ..."],
  "tools": ["Required tool or part"],
  "followups": ["Follow-up question 1", "Follow-up question 2"]
}}

Rules:
- High severity = stop immediately, genuine danger present
- Medium = proceed with caution
- Low = minor issue, routine repair
- Adapt vocabulary and detail level to the user's skill level
- Always include exactly 2 follow-up questions
- For dangerous situations ALWAYS include a clear warning
- If no image is provided, answer helpfully about the topic in JSON format"""


def build_system_prompt(category: str, skill_level: str,
                        is_video: bool = False,
                        yolo_context: str = "",
                        rag_context: str = "") -> str:
    return SYSTEM_PROMPT_TEMPLATE.format(
        category=category,
        skill_level=skill_level,
        video_note="NOTE: Input is a video frame — look for motion clues (fluid trails, smoke, sparks, blur)." if is_video else "",
        yolo_note=f"\nPre-analysis (YOLO):\n{yolo_context}" if yolo_context else "",
        rag_note=f"\nRelevant repair knowledge:\n{rag_context}" if rag_context else "",
    )


def parse_response(raw: str) -> dict:
    try:
        clean = raw.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except json.JSONDecodeError:
        return {
            "message": raw,
            "diagnosis": None,
            "warning": None,
            "steps": [],
            "tools": [],
            "followups": ["Tell me more about this issue", "What tools will I need?"],
        }


def call_claude(messages: List[dict], system: str) -> str:
    model = genai.GenerativeModel(settings.GEMINI_MODEL, system_instruction=system)
    contents = []
    for m in messages:
        if isinstance(m["content"], str):
            contents.append(m["content"])
        else:
            for block in m["content"]:
                if block["type"] == "text":
                    contents.append(block["text"])
                elif block["type"] == "image":
                    contents.append({
                        "mime_type": block["source"]["media_type"],
                        "data": __import__("base64").b64decode(block["source"]["data"]),
                    })
    response = model.generate_content(contents)
    return response.text


def build_image_message(user_text: str, image_b64: str, media_type: str = "image/jpeg") -> dict:
    return {
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": image_b64}},
            {"type": "text", "text": user_text},
        ],
    }


def build_text_message(user_text: str) -> dict:
    return {"role": "user", "content": user_text}