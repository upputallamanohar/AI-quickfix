"""Diagnostic result model."""
from sqlalchemy import Column, String, DateTime, Float, Integer, Text, ForeignKey, Boolean
from datetime import datetime
import uuid
from app.database.db import Base

class DiagnosticResult(Base):
    __tablename__ = "diagnostic_results"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"), nullable=True)
    category = Column(String)
    issue = Column(String, nullable=True)
    component = Column(String, nullable=True)
    severity = Column(String, nullable=True)            # Low|Medium|High
    confidence = Column(Float, nullable=True)
    warning = Column(Text, nullable=True)
    steps_json = Column(Text, default="[]")             # JSON array
    tools_json = Column(Text, default="[]")             # JSON array
    has_image = Column(Boolean, default=False)
    is_video_frame = Column(Boolean, default=False)
    media_path = Column(String, nullable=True)
    raw_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
