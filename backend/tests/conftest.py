"""Pytest fixtures for testing."""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.src.models import Base


@pytest.fixture
def db_session():
    """In-memory SQLite database for testing."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def sample_submission_data():
    """Valid submission data for testing."""
    return {
        "project_name": "Test Project",
        "project_overview": "A" * 100,  # 100 chars (>= 50 minimum)
        "administrative_info": "test@example.com - Test Requestor",
        "timeline": "One week starting 2026-03-20",
        "technical_requirements": "Containerized deployment on Linux server",
        "user_accounts": "pi@example.com - Principal Investigator",
        "notes": "Test submission",
        "attachments": "None",
    }
