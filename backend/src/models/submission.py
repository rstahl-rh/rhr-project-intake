"""Submission ORM model for project intake requests."""

from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from . import Base


class Submission(Base):
    """Project intake submission entity."""

    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_name = Column(String(200), nullable=False)
    project_overview = Column(Text, nullable=False)
    administrative_info = Column(Text, nullable=False)
    timeline = Column(Text, nullable=False)
    technical_requirements = Column(Text, nullable=False)
    user_accounts = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    attachments = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=True, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Submission(id={self.id}, project_name='{self.project_name}')>"
