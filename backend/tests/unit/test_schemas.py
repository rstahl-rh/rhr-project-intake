"""Unit tests for Pydantic schemas."""

import pytest
from pydantic import ValidationError
from backend.src.models.schemas import SubmissionCreate


def test_submission_create_with_valid_data():
    """Test SubmissionCreate with all valid fields."""
    data = {
        "project_name": "Test Project",
        "project_overview": "A" * 100,
        "administrative_info": "test@example.com - Test Person",
        "timeline": "One week",
        "technical_requirements": "Basic requirements here with sufficient text",
        "user_accounts": "pi@example.com - Principal Investigator",
    }
    submission = SubmissionCreate(**data)
    assert submission.project_name == "Test Project"
    assert len(submission.project_overview) == 100


def test_submission_create_project_overview_too_short():
    """Test validation error when project_overview is too short."""
    data = {
        "project_name": "Test",
        "project_overview": "Too short",  # Less than 50 chars
        "administrative_info": "test@example.com",
        "timeline": "One week",
        "technical_requirements": "Requirements text here",
        "user_accounts": "pi@example.com - PI",
    }
    with pytest.raises(ValidationError) as exc_info:
        SubmissionCreate(**data)

    errors = exc_info.value.errors()
    assert any("project_overview" in str(e["loc"]) for e in errors)


def test_email_validator_administrative_info_missing_email():
    """Test email validation for administrative_info field."""
    data = {
        "project_name": "Test",
        "project_overview": "A" * 100,
        "administrative_info": "No email here",
        "timeline": "One week",
        "technical_requirements": "Requirements text here",
        "user_accounts": "pi@example.com - PI",
    }
    with pytest.raises(ValidationError) as exc_info:
        SubmissionCreate(**data)

    errors = exc_info.value.errors()
    assert any("email" in str(e["msg"]).lower() for e in errors)


def test_email_validator_user_accounts_missing_email():
    """Test email validation for user_accounts field."""
    data = {
        "project_name": "Test",
        "project_overview": "A" * 100,
        "administrative_info": "test@example.com - Test",
        "timeline": "One week",
        "technical_requirements": "Requirements text here",
        "user_accounts": "No email here",
    }
    with pytest.raises(ValidationError) as exc_info:
        SubmissionCreate(**data)

    errors = exc_info.value.errors()
    assert any("email" in str(e["msg"]).lower() for e in errors)


def test_optional_fields_can_be_none():
    """Test that notes and attachments can be None."""
    data = {
        "project_name": "Test",
        "project_overview": "A" * 100,
        "administrative_info": "test@example.com - Test",
        "timeline": "One week",
        "technical_requirements": "Requirements text here",
        "user_accounts": "pi@example.com - PI",
        "notes": None,
        "attachments": None,
    }
    submission = SubmissionCreate(**data)
    assert submission.notes is None
    assert submission.attachments is None
