"""Session model – one per troubleshooting conversation."""
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from datetime import datetime
import uuid
from app.database.db import Base

class Session(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    category = Column(String, default="General")
    skill_level = Column(String, default="intermediate")
    status = Column(String, default="active")  # active|resolved|abandoned
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    summary = Column(Text, nullable=True)
