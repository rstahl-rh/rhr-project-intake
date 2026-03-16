"""Unit tests for database functions."""

from backend.src.services.database import (
    create_submission,
    list_submissions,
    get_submission,
)
from backend.src.models.schemas import SubmissionCreate


def test_create_submission_with_valid_data(db_session, sample_submission_data):
    """Test creating a submission with valid data."""
    submission_data = SubmissionCreate(**sample_submission_data)
    result = create_submission(db_session, submission_data)

    assert result.id is not None
    assert result.project_name == "Test Project"
    assert result.created_at is not None


def test_list_submissions_returns_ordered_by_recent(db_session):
    """Test list_submissions returns most recent first."""
    from backend.src.models.submission import Submission

    # Create multiple submissions
    for i in range(3):
        submission = Submission(
            project_name=f"Project {i}",
            project_overview="A" * 100,
            administrative_info="test@example.com",
            timeline="One week",
            technical_requirements="Requirements here",
            user_accounts="pi@example.com - PI",
        )
        db_session.add(submission)
    db_session.commit()

    results = list_submissions(db_session)
    assert len(results) == 3
    # Most recent should be "Project 2"
    assert results[0].project_name == "Project 2"


def test_get_submission_by_id_returns_submission(db_session):
    """Test get_submission returns the correct submission."""
    from backend.src.models.submission import Submission

    submission = Submission(
        project_name="Test Project",
        project_overview="A" * 100,
        administrative_info="test@example.com",
        timeline="One week",
        technical_requirements="Requirements here",
        user_accounts="pi@example.com - PI",
    )
    db_session.add(submission)
    db_session.commit()

    result = get_submission(db_session, submission.id)
    assert result is not None
    assert result.id == submission.id
    assert result.project_name == "Test Project"


def test_get_submission_returns_none_for_nonexistent_id(db_session):
    """Test get_submission returns None for nonexistent ID."""
    result = get_submission(db_session, 99999)
    assert result is None


def test_list_submissions_with_pagination(db_session):
    """Test list_submissions respects pagination parameters."""
    from backend.src.models.submission import Submission

    # Create 5 submissions
    for i in range(5):
        submission = Submission(
            project_name=f"Project {i}",
            project_overview="A" * 100,
            administrative_info="test@example.com",
            timeline="One week",
            technical_requirements="Requirements here",
            user_accounts="pi@example.com - PI",
        )
        db_session.add(submission)
    db_session.commit()

    # Test limit
    results = list_submissions(db_session, limit=3)
    assert len(results) == 3

    # Test offset
    results_with_offset = list_submissions(db_session, limit=3, offset=2)
    assert len(results_with_offset) == 3
    # Should skip first 2 and get different results
    assert results_with_offset[0].id != results[0].id
