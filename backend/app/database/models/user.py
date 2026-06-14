"""User model."""
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.sqlite import TEXT
from datetime import datetime
import uuid
from app.database.db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=True)
    display_name = Column(String, default="Guest")
    skill_level = Column(String, default="intermediate")  # beginner|intermediate|advanced
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
